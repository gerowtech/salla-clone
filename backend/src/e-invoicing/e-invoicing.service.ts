import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';

type ConfigRow = {
  id: string;
  countryCode: string;
  countryName: string;
  integration: string;
  environment: string;
  status: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class EInvoicingService {
  private tableReady: Promise<void> | null = null;

  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}

  private async verify(token: string): Promise<string> {
    if (!token) throw new UnauthorizedException('Bearer token required');
    try {
      const payload: any = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      });
      if (!payload?.sub || payload.companyId == null) throw new Error('Missing active company');
      return String(payload.companyId);
    } catch {
      throw new UnauthorizedException('Invalid session or active company. Please sign in again.');
    }
  }

  /**
   * OW Platform already has a richer e_invoicing_configs table. Do not create a
   * simplified replacement: that would leave the existing table unchanged and
   * make CRUD queries fail on the missing `integration`/`settings` columns.
   */
  private async ensureTable(): Promise<void> {
    if (!this.tableReady) {
      this.tableReady = this.db.$queryRawUnsafe<any[]>(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'e_invoicing_configs' LIMIT 1`,
      ).then((rows) => {
        if (!rows.length) {
          throw new Error('The public.e_invoicing_configs table is missing. Apply the OW Platform E-Invoicing database migration first.');
        }
      }).catch((error) => {
        this.tableReady = null;
        throw error;
      });
    }
    await this.tableReady;
  }

  private toDto(row: any): ConfigRow {
    let settings: Record<string, unknown> = {};
    if (row.notes) {
      try {
        const parsed = JSON.parse(row.notes);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) settings = parsed;
      } catch {
        settings = { notes: row.notes };
      }
    }
    return {
      id: String(row.id),
      countryCode: row.country_code,
      countryName: row.country_name,
      integration: row.provider_name || row.provider_code,
      environment: row.environment,
      status: row.is_enabled ? 'Active' : 'Inactive',
      settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async list(token: string): Promise<ConfigRow[]> {
    const companyId = await this.verify(token);
    await this.ensureTable();
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `SELECT id, country_code, country_name, provider_code, provider_name,
              environment, is_enabled, notes, created_at, updated_at
       FROM public.e_invoicing_configs
       WHERE company_id = $1::bigint
       ORDER BY country_name, id DESC`,
      companyId,
    );
    return rows.map((row) => this.toDto(row));
  }

  private validate(body: any, creating: boolean) {
    const countryCode = body.countryCode === undefined ? undefined : String(body.countryCode).trim().toUpperCase();
    const countryName = body.countryName === undefined ? undefined : String(body.countryName).trim();
    const integration = body.integration === undefined ? undefined : String(body.integration).trim();
    if (creating && !countryCode) throw new BadRequestException('Country code is required');
    if (creating && !countryName) throw new BadRequestException('Country name is required');
    if (creating && !integration) throw new BadRequestException('Integration is required');
    if (body.countryCode !== undefined && !countryCode) throw new BadRequestException('Country code cannot be empty');
    if (body.countryName !== undefined && !countryName) throw new BadRequestException('Country name cannot be empty');
    if (body.integration !== undefined && !integration) throw new BadRequestException('Integration cannot be empty');
    if (body.settings !== undefined && (!body.settings || typeof body.settings !== 'object' || Array.isArray(body.settings))) {
      throw new BadRequestException('Settings must be a JSON object');
    }
    const environment = body.environment === undefined ? undefined : String(body.environment).trim();
    const status = body.status === undefined ? undefined : String(body.status).trim();
    if (environment !== undefined && !['Sandbox', 'Production', 'Test'].includes(environment)) {
      throw new BadRequestException('Environment must be Sandbox, Production, or Test');
    }
    if (status !== undefined && !['Active', 'Inactive'].includes(status)) {
      throw new BadRequestException('Status must be Active or Inactive');
    }
    return { countryCode, countryName, integration, environment, status, settings: body.settings };
  }

  async create(token: string, body: any): Promise<ConfigRow> {
    const companyId = await this.verify(token);
    await this.ensureTable();
    const value = this.validate(body, true);
    const providerCode = `${value.countryCode!.toLowerCase()}_einvoicing`;
    const enabled = value.status === 'Active';
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `INSERT INTO public.e_invoicing_configs
       (company_id, country_code, country_name, provider_code, provider_name,
        environment, next_invoice_number, tax_rate, request_timeout, retry_attempts,
        is_enabled, is_default, connection_status, notes, created_at, updated_at)
       VALUES ($1::bigint, $2, $3, $4, $5, $6, 1, 0, 30, 3, $7, false, $8, $9, NOW(), NOW())
       RETURNING id, country_code, country_name, provider_code, provider_name,
                 environment, is_enabled, notes, created_at, updated_at`,
      companyId,
      value.countryCode,
      value.countryName,
      providerCode,
      value.integration,
      value.environment || 'Sandbox',
      enabled,
      enabled ? 'Configured' : 'Not Configured',
      JSON.stringify(value.settings || {}),
    );
    return this.toDto(rows[0]);
  }

  async update(token: string, id: string, body: any): Promise<ConfigRow> {
    const companyId = await this.verify(token);
    await this.ensureTable();
    if (!/^\d+$/.test(id)) throw new BadRequestException('Invalid configuration ID');
    const value = this.validate(body, false);
    const sets: string[] = [];
    const args: any[] = [];
    const add = (column: string, valueToSet: any, cast = '') => {
      if (valueToSet === undefined) return;
      args.push(valueToSet);
      sets.push(`${column} = $${args.length}${cast}`);
    };
    add('country_code', value.countryCode);
    add('country_name', value.countryName);
    add('provider_name', value.integration);
    if (value.countryCode !== undefined) add('provider_code', `${value.countryCode.toLowerCase()}_einvoicing`);
    add('environment', value.environment);
    if (value.status !== undefined) {
      add('is_enabled', value.status === 'Active');
      add('connection_status', value.status === 'Active' ? 'Configured' : 'Not Configured');
    }
    if (value.settings !== undefined) add('notes', JSON.stringify(value.settings));
    if (!sets.length) throw new BadRequestException('No changes supplied');
    sets.push('updated_at = NOW()');
    args.push(id, companyId);
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `UPDATE public.e_invoicing_configs SET ${sets.join(', ')}
       WHERE id = $${args.length - 1}::bigint AND company_id = $${args.length}::bigint
       RETURNING id, country_code, country_name, provider_code, provider_name,
                 environment, is_enabled, notes, created_at, updated_at`,
      ...args,
    );
    if (!rows.length) throw new NotFoundException('E-Invoicing configuration not found');
    return this.toDto(rows[0]);
  }

  async remove(token: string, id: string) {
    const companyId = await this.verify(token);
    await this.ensureTable();
    if (!/^\d+$/.test(id)) throw new BadRequestException('Invalid configuration ID');
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `DELETE FROM public.e_invoicing_configs
       WHERE id = $1::bigint AND company_id = $2::bigint
       RETURNING id`,
      id,
      companyId,
    );
    if (!rows.length) throw new NotFoundException('E-Invoicing configuration not found');
    return { success: true, message: 'Configuration deleted' };
  }
}
