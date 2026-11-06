import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from '../common/bcrypt';
import { PrismaService } from '../common/prisma.service';
import { LoginDto, RegisterDto } from './dto';

type DbUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  status: string;
};
type CompanyMembership = {
  id: string;
  name: string;
  role: string;
  isDefault: boolean;
};
type DbCompany = { id: string; name: string; isDefault: boolean; role?: string | null };

@Injectable()
export class AuthService {
  private readonly columnCache = new Map<string, Set<string>>();

  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}

  /**
   * Legacy database-compatible login.
   * The deployed PostgreSQL schema uses users.id BIGINT, users.name and
   * users.password; do not use Prisma's newer UUID/passwordHash User model here.
   */
  async login(dto: LoginDto) {
    const email = String(dto.email ?? '').trim().toLowerCase();
    const password = String(dto.password ?? '');
    if (!email || !password) throw new UnauthorizedException('Invalid email or password');

    const rows = await this.db.$queryRawUnsafe<DbUser[]>(
      `SELECT id::text AS id,
              email::text AS email,
              COALESCE(name::text, '') AS name,
              password::text AS password,
              COALESCE(status::text, 'active') AS status
         FROM public.users
        WHERE lower(email::text) = $1
        LIMIT 1`,
      email,
    );
    const user = rows[0];
    if (!user || !this.isActive(user.status)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const storedPassword = String(user.password ?? '');
    const validPassword = await this.verifyAndUpgradePassword(user.id, password, storedPassword);
    if (!validPassword) throw new UnauthorizedException('Invalid email or password');

    const companies = await this.findCompanyMemberships(user.id);
    if (companies.length === 0) {
      throw new ForbiddenException(
        'Your account is active, but it is not linked to an active company. Ask your administrator to assign a company.',
      );
    }

    const selected = companies.find((company) => company.isDefault) ?? companies[0];
    return this.createSession(user, selected.id, companies);
  }

  async selectCompany(userId: string, companyId: string) {
    const users = await this.db.$queryRawUnsafe<DbUser[]>(
      `SELECT id::text AS id,
              email::text AS email,
              COALESCE(name::text, '') AS name,
              ''::text AS password,
              COALESCE(status::text, 'active') AS status
         FROM public.users
        WHERE id::text = $1
        LIMIT 1`,
      String(userId),
    );
    const user = users[0];
    if (!user || !this.isActive(user.status)) {
      throw new UnauthorizedException('User account is inactive');
    }

    const companies = await this.findCompanyMemberships(user.id);
    const selectedCompanyId = String(companyId ?? '');
    if (!companies.some((company) => company.id === selectedCompanyId)) {
      throw new ForbiddenException('You do not have access to this company');
    }
    return this.createSession(user, selectedCompanyId, companies);
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.jwtSecret(),
      });
      if (!payload?.sub) throw new Error('Missing token subject');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private async verifyAndUpgradePassword(userId: string, supplied: string, stored: string) {
    if (!stored) return false;

    // bcrypt hashes normally start with $2a$, $2b$ or $2y$.
    if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(stored)) {
      try {
        return await bcrypt.compare(supplied, stored);
      } catch {
        return false;
      }
    }

    // Transitional support for old demo accounts. Upgrade only the matching
    // row/value, so concurrent logins or password changes are not overwritten.
    if (stored !== supplied) return false;
    const upgradedHash = await bcrypt.hash(supplied, 12);
    await this.db.$executeRawUnsafe(
      `UPDATE public.users
          SET password = $1, updated_at = NOW()
        WHERE id::text = $2 AND password = $3`,
      upgradedHash,
      String(userId),
      stored,
    );
    return true;
  }

  private async findCompanyMemberships(userId: string): Promise<CompanyMembership[]> {
    const companyColumns = await this.columnsFor('companies');
    if (!companyColumns.has('id') || !companyColumns.has('name')) return [];

    // Only use table/column identifiers discovered in information_schema.
    // Values (including userId) are always bound as SQL parameters.
    const membershipTables = ['company_users', 'company_user', 'user_companies', 'user_roles'];
    for (const table of membershipTables) {
      const columns = await this.columnsFor(table);
      const userColumn = this.firstExisting(columns, ['user_id', 'userId']);
      const companyColumn = this.firstExisting(columns, ['company_id', 'companyId']);
      if (!userColumn || !companyColumn) continue;

      const statusColumn = this.firstExisting(columns, ['status', 'is_active', 'isActive']);
      const activeMembership = statusColumn
        ? statusColumn.toLowerCase().includes('is_') || statusColumn === 'isActive'
          ? `AND COALESCE(m.${this.q(statusColumn)}, true) = true`
          : `AND lower(COALESCE(m.${this.q(statusColumn)}::text, 'active')) IN ('active','enabled','1','true')`
        : '';
      const defaultColumn = this.firstExisting(columns, ['is_default', 'isDefault']);
      const defaultExpr = defaultColumn
        ? `COALESCE(m.${this.q(defaultColumn)}, false)`
        : 'false';
      const companyActive = companyColumns.has('is_active')
        ? 'AND COALESCE(c.is_active, true) = true'
        : companyColumns.has('status')
          ? `AND lower(COALESCE(c.status::text, 'active')) IN ('active','enabled','1','true')`
          : '';
      const orderExpr = defaultColumn
        ? `m.${this.q(defaultColumn)} DESC, c.name ASC`
        : 'c.name ASC';

      const rows = await this.db.$queryRawUnsafe<DbCompany[]>(
        `SELECT c.id::text AS id,
                c.name::text AS name,
                ${defaultExpr} AS "isDefault"
           FROM public.${this.q(table)} AS m
           JOIN public.companies AS c
             ON c.id::text = m.${this.q(companyColumn)}::text
          WHERE m.${this.q(userColumn)}::text = $1
            ${activeMembership}
            ${companyActive}
          ORDER BY ${orderExpr}`,
        String(userId),
      );
      if (rows.length) {
        return rows.map((row) => ({
          id: String(row.id),
          name: String(row.name),
          role: 'user',
          isDefault: Boolean(row.isDefault),
        }));
      }
    }

    // Some older installations keep ownership on the companies table itself.
    for (const ownerColumn of ['owner_user_id', 'user_id', 'created_by']) {
      if (!companyColumns.has(ownerColumn)) continue;
      const active = companyColumns.has('is_active')
        ? 'AND COALESCE(is_active, true) = true'
        : companyColumns.has('status')
          ? `AND lower(COALESCE(status::text, 'active')) IN ('active','enabled','1','true')`
          : '';
      const rows = await this.db.$queryRawUnsafe<Array<{ id: string; name: string }>>(
        `SELECT id::text AS id, name::text AS name
           FROM public.companies
          WHERE ${this.q(ownerColumn)}::text = $1 ${active}
          ORDER BY name`,
        String(userId),
      );
      if (rows.length) {
        return rows.map((row) => ({
          id: String(row.id),
          name: String(row.name),
          role: 'owner',
          isDefault: true,
        }));
      }
    }
    return [];
  }

  private async columnsFor(table: string): Promise<Set<string>> {
    const cached = this.columnCache.get(table);
    if (cached) return cached;
    const rows = await this.db.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1`,
      table,
    );
    const columns = new Set(rows.map((row) => row.column_name));
    this.columnCache.set(table, columns);
    return columns;
  }

  private async createSession(
    user: DbUser,
    companyId: string,
    companies: CompanyMembership[],
  ) {
    const activeCompany = companies.find((company) => company.id === companyId);
    if (!activeCompany) throw new ForbiddenException('You do not have access to this company');

    const role = activeCompany.role || 'user';
    const payload = {
      sub: String(user.id), // BIGINT IDs are serialized as strings in JWT claims.
      email: user.email,
      companyId: String(companyId),
      role,
      permissions: [] as string[],
    };
    const accessTtl = process.env.JWT_ACCESS_TTL || '15m';
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.jwtSecret(),
      expiresIn: accessTtl as any,
    });

    const nameParts = String(user.name || '').trim().split(/\s+/).filter(Boolean);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: accessTtl,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' '),
        displayName: user.name,
        status: user.status,
        position: role === 'owner' ? 'Owner' : 'User',
        role,
      },
      activeCompanyId: String(companyId),
      permissions: [],
      companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
        isDefault: company.isDefault,
        role: company.role,
        position: company.role === 'owner' ? 'Owner' : 'User',
        permissions: [],
      })),
    };
  }

  private isActive(status: unknown) {
    return ['active', 'enabled', '1', 'true'].includes(String(status ?? '').toLowerCase());
  }

  private jwtSecret() {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET (or JWT_SECRET) must contain at least 32 characters in the backend environment.',
      );
    }
    return secret;
  }

  private firstExisting(columns: Set<string>, candidates: string[]) {
    return candidates.find((column) => columns.has(column));
  }

  private q(identifier: string) {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  async register(_dto: RegisterDto) {
    // Legacy users table is BIGINT/name/password. Do not write through the
    // incompatible UUID/passwordHash Prisma model or mutate the schema here.
    throw new ForbiddenException(
      'Self-registration is not enabled for this legacy database. Contact your administrator.',
    );
  }
}
