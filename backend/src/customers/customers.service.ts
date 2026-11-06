import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';

type Col = { column_name: string; is_nullable: string; column_default: string | null; data_type: string };
function jsonSafe(value: any): any {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date || value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(jsonSafe);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonSafe(item)]));
}
@Injectable()
export class CustomersService {
  private columnsPromise: Promise<Col[]> | null = null;
  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}

  private async verify(token: string): Promise<string> {
    if (!token) throw new UnauthorizedException('Bearer token required');
    let payload: any;
    try { payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET }); }
    catch { throw new UnauthorizedException('Invalid or expired session'); }
    // The active company must be the company embedded in the signed access token.
    // This prevents a client from changing x-company-id to access another tenant.
    if (!payload?.sub || payload.companyId == null || String(payload.companyId).trim() === '') {
      throw new UnauthorizedException('The access token has no active company. Please sign in again.');
    }
    // Tenant identity comes only from the signed JWT. x-company-id is a UI hint,
    // never an authorization source; stale localStorage must not cause false 403s.
    return String(payload.companyId);
  }
  private async columns(): Promise<Col[]> {
    if (!this.columnsPromise) this.columnsPromise = this.db.$queryRawUnsafe<Col[]>(
      `SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' ORDER BY ordinal_position`);
    const cols = await this.columnsPromise;
    if (!cols.length) throw new BadRequestException('The public.customers table was not found in PostgreSQL');
    return cols;
  }
  private has(cols: Col[], name: string) { return cols.some(c => c.column_name === name); }
  private cast(cols: Col[], name: string): string {
    const type = cols.find(c => c.column_name === name)?.data_type;
    if (type === 'bigint') return 'bigint';
    if (type === 'integer' || type === 'smallint') return 'integer';
    if (type === 'uuid') return 'uuid';
    return 'text';
  }
  private validateId(id: string, cast: string) {
    if (cast === 'bigint' || cast === 'integer') {
      if (!/^-?\d+$/.test(String(id))) throw new BadRequestException('Invalid numeric record ID');
    } else if (cast === 'uuid' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))) {
      throw new BadRequestException('Invalid UUID record ID');
    }
  }
  private map(r: any) {
    return jsonSafe({ ...r, id: String(r.id), companyId: r.company_id == null ? undefined : String(r.company_id),
      customerCode: r.customer_code ?? null, name: r.name ?? '', customerType: r.customer_type ?? 'individual',
      companyName: r.company_name ?? null, email: r.email ?? null, phone: r.phone ?? null, mobile: r.mobile ?? null,
      taxNumber: r.tax_number ?? null, nationalId: r.national_id ?? null,
      openingBalance: Number(r.opening_balance ?? 0), currentBalance: Number(r.current_balance ?? 0), creditLimit: Number(r.credit_limit ?? 0), paymentTerms: Number(r.payment_terms ?? 0), isActive: r.is_active ?? true, notes: r.notes ?? null, address: r.address ?? r.billing_address ?? null,
      city: r.city ?? r.billing_city ?? null, createdAt: r.created_at ?? null, updatedAt: r.updated_at ?? null });
  }
  async list(token: string, companyId: string) {
    companyId = await this.verify(token); const cols = await this.columns();
    const scoped = this.has(cols, 'company_id');
    if (!scoped) throw new BadRequestException('public.customers.company_id is required for tenant isolation');
    const rows = await this.db.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.customers WHERE company_id = $1::${this.cast(cols, 'company_id')}${this.has(cols,'deleted_at') ? ' AND deleted_at IS NULL' : ''} ORDER BY ${this.has(cols,'created_at') ? 'created_at' : 'id'} DESC`,
      companyId);
    return rows.map(r => this.map(r));
  }
  private entries(companyId: string, body: any, cols: Col[], creating: boolean) {
    const name = String(body.name ?? '').trim();
    if ((creating || body.name !== undefined) && !name) throw new BadRequestException('Customer name is required');
    const credit = body.creditLimit === undefined ? undefined : Number(body.creditLimit);
    if (credit !== undefined && (!Number.isFinite(credit) || credit < 0)) throw new BadRequestException('Credit limit must be zero or greater');
    const values: Record<string, any> = {
      company_id: companyId,
      customer_code: body.customerCode === undefined ? (creating ? `CUS-${Date.now()}` : undefined) : (String(body.customerCode).trim() || null),
      name: body.name === undefined ? undefined : name,
      customer_type: body.customerType === undefined ? (creating ? 'individual' : undefined) : body.customerType,
      company_name: body.companyName === undefined ? undefined : (String(body.companyName).trim() || null),
      email: body.email === undefined ? undefined : (String(body.email).trim() || null),
      phone: body.phone === undefined ? undefined : (String(body.phone).trim() || null),
      mobile: body.mobile === undefined ? undefined : (String(body.mobile).trim() || null),
      tax_number: body.taxNumber === undefined ? undefined : (String(body.taxNumber).trim() || null),
      national_id: body.nationalId === undefined ? undefined : (String(body.nationalId).trim() || null),
      credit_limit: credit,
      address: body.address === undefined ? undefined : (String(body.address).trim() || null),
      billing_address: body.address === undefined ? undefined : (String(body.address).trim() || null),
      city: body.city === undefined ? undefined : (String(body.city).trim() || null),
      billing_city: body.city === undefined ? undefined : (String(body.city).trim() || null),
      state: body.state === undefined ? undefined : (String(body.state).trim() || null),
      country: body.country === undefined ? undefined : (String(body.country).trim() || null),
      postal_code: body.postalCode === undefined ? undefined : (String(body.postalCode).trim() || null),
      notes: body.notes === undefined ? undefined : (String(body.notes).trim() || null),
    };
    const entries = Object.entries(values).filter(([k,v]) => this.has(cols,k) && v !== undefined);
    const missing = cols.filter(c => c.is_nullable === 'NO' && !c.column_default && c.column_name !== 'id' && !entries.some(([k]) => k === c.column_name));
    if (missing.length) throw new BadRequestException(`Required customer fields missing: ${missing.map(c=>c.column_name).join(', ')}`);
    return entries;
  }
  async create(token: string, companyId: string, body: any) {
    companyId = await this.verify(token); const cols = await this.columns(); const entries = this.entries(companyId, body, cols, true);
    const names = entries.map(([k]) => `"${k}"`).join(', ');
    // customers.id and customers.company_id are BIGINT in the supplied PostgreSQL backup.
    const params = entries.map(([key], i) =>
      key === 'company_id' ? `$${i + 1}::${this.cast(cols, 'company_id')}` : `$${i + 1}`,
    ).join(', ');
    const rows = await this.db.$queryRawUnsafe<any[]>(`INSERT INTO public.customers (${names}) VALUES (${params}) RETURNING *`, ...entries.map(([,v])=>v));
    return this.map(rows[0]);
  }
  async update(token: string, companyId: string, id: string, body: any) {
    companyId = await this.verify(token); const cols = await this.columns(); const scoped = this.has(cols,'company_id'); if (!scoped) throw new BadRequestException('public.customers.company_id is required for tenant isolation');
    const idCast = this.cast(cols, 'id'); const companyCast = this.cast(cols, 'company_id'); this.validateId(id, idCast);
    const current = await this.db.$queryRawUnsafe<any[]>(`SELECT * FROM public.customers WHERE id = $1::${idCast}${scoped?` AND company_id = $2::${companyCast}`:''}${this.has(cols,'deleted_at') ? ' AND deleted_at IS NULL' : ''} LIMIT 1`, ...(scoped?[id,companyId]:[id]));
    if (!current.length) throw new NotFoundException('Customer not found');
    const entries = this.entries(companyId, body, cols, false).filter(([k])=>k!=='company_id');
    if (!entries.length) return this.map(current[0]);
    const sets = entries.map(([k],i)=>`"${k}" = $${i+1}`); const values = entries.map(([,v])=>v); values.push(id);
    let where = `id = $${values.length}::${idCast}`;
    if (scoped) { values.push(companyId); where += ` AND company_id = $${values.length}::${companyCast}`; }
    if (this.has(cols,'updated_at')) sets.push('"updated_at" = NOW()');
    const rows = await this.db.$queryRawUnsafe<any[]>(`UPDATE public.customers SET ${sets.join(', ')} WHERE ${where} RETURNING *`, ...values);
    return this.map(rows[0]);
  }
  async remove(token: string, companyId: string, id: string) {
    companyId = await this.verify(token); const cols = await this.columns(); const scoped = this.has(cols,'company_id'); if (!scoped) throw new BadRequestException('public.customers.company_id is required for tenant isolation');
    const idCast = this.cast(cols, 'id'); const companyCast = this.cast(cols, 'company_id'); this.validateId(id, idCast);
    if (this.has(cols, 'deleted_at')) {
      const rows = await this.db.$queryRawUnsafe<any[]>(`UPDATE public.customers SET deleted_at = NOW()${this.has(cols,'updated_at') ? ', updated_at = NOW()' : ''} WHERE id = $1::${idCast}${scoped?` AND company_id = $2::${companyCast}`:''} AND deleted_at IS NULL RETURNING id`, ...(scoped?[id,companyId]:[id]));
      if (!rows.length) throw new NotFoundException('Customer not found');
    } else {
      const rows = await this.db.$queryRawUnsafe<any[]>(`DELETE FROM public.customers WHERE id = $1::${idCast}${scoped?` AND company_id = $2::${companyCast}`:''} RETURNING id`, ...(scoped?[id,companyId]:[id]));
      if (!rows.length) throw new NotFoundException('Customer not found');
    }
    return { success: true, message: 'Customer deleted' };
  }
}
