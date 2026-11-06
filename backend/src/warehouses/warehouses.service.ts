import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';

type ColumnInfo = { column_name: string; data_type: string; is_nullable: string; column_default: string | null };
function jsonSafe(value: any): any {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date || value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(jsonSafe);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonSafe(item)]));
}

@Injectable()
export class WarehousesService {
  private columnsPromise: Promise<ColumnInfo[]> | null = null;
  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}

  private async columns(): Promise<ColumnInfo[]> {
    if (!this.columnsPromise) {
      this.columnsPromise = this.db.$queryRawUnsafe<ColumnInfo[]>(
        `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'warehouses'
          ORDER BY ordinal_position`,
      );
    }
    const columns = await this.columnsPromise;
    if (!columns.length) throw new NotFoundException('The public.warehouses table was not found');
    return columns;
  }

  async listForCompany(token: string, companyId: string) {
    if (!token) throw new UnauthorizedException('Bearer token required');
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
    if (!payload?.sub || payload.companyId == null || String(payload.companyId).trim() === '') {
      throw new UnauthorizedException('The access token has no active company. Please sign in again.');
    }
    // Use the signed JWT tenant claim. A stale/missing x-company-id header must
    // not block a valid session, and the header is never trusted for isolation.
    companyId = String(payload.companyId);

    const columns = await this.columns();
    const names = new Set(columns.map((c) => c.column_name));
    if (!names.has('company_id')) {
      // Never return an unscoped warehouse list in a multi-company application.
      throw new ForbiddenException('warehouses.company_id is required for company isolation');
    }
    const companyColumn = columns.find((c) => c.column_name === 'company_id')!;
    const companyCast = companyColumn.data_type === 'bigint' ? 'bigint'
      : companyColumn.data_type === 'integer' || companyColumn.data_type === 'smallint' ? 'integer'
      : companyColumn.data_type === 'uuid' ? 'uuid' : 'text';
    if ((companyCast === 'bigint' || companyCast === 'integer') && !/^-?\d+$/.test(companyId)) {
      throw new ForbiddenException('The active company ID in your session does not match the warehouse schema. Sign out and sign in again.');
    }
    const orderColumn = names.has('name') ? 'name' : names.has('id') ? 'id' : columns[0].column_name;
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.warehouses WHERE company_id = $1::${companyCast} ORDER BY "${orderColumn.replace(/"/g, '""')}" ASC`,
      String(companyId),
    );
    return rows.map((row) => jsonSafe({
      ...row,
      id: row.id == null ? null : String(row.id),
      companyId: row.company_id == null ? null : String(row.company_id),
      branchId: row.branch_id == null ? null : String(row.branch_id),
      isActive: row.is_active ?? true,
    }));
  }
}
