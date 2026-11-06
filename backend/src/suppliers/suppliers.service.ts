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
export class SuppliersService {
  private columnsPromise: Promise<Col[]> | null = null;
  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}
  private async verify(token: string): Promise<string> {
    if (!token) throw new UnauthorizedException('Bearer token required');
    let payload: any;
    try { payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET }); }
    catch { throw new UnauthorizedException('Invalid or expired session'); }
    // The active company must be the company embedded in the signed access token.
    // This prevents a client from changing x-company-id to access another tenant.
    if (!payload?.sub || payload.companyId == null || String(payload.companyId).trim() === '') throw new UnauthorizedException('The access token has no active company. Please sign in again.');
    return String(payload.companyId);
  }
  private async columns(): Promise<Col[]> {
    if (!this.columnsPromise) this.columnsPromise = this.db.$queryRawUnsafe<Col[]>(`SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='suppliers' ORDER BY ordinal_position`);
    const cols = await this.columnsPromise;
    if (!cols.length) throw new BadRequestException('The public.suppliers table was not found in PostgreSQL');
    return cols;
  }
  private has(cols: Col[], name: string) { return cols.some(c => c.column_name === name); }
  private cast(cols: Col[], name: string): string { const t=cols.find(c=>c.column_name===name)?.data_type; return t==='bigint'?'bigint':(t==='integer'||t==='smallint')?'integer':t==='uuid'?'uuid':'text'; }
  private validateId(id:string, cast:string) { if ((cast==='bigint'||cast==='integer') && !/^-?\d+$/.test(String(id))) throw new BadRequestException('Invalid numeric record ID'); if (cast==='uuid' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))) throw new BadRequestException('Invalid UUID record ID'); }
  private async rows(companyId: string) {
    const cols = await this.columns();
    if (!this.has(cols, 'company_id')) throw new BadRequestException('public.suppliers.company_id is required for tenant isolation');
    const where = this.has(cols, 'company_id') ? ` WHERE company_id = $1::${this.cast(cols, 'company_id')}` : '';
    const result = await this.db.$queryRawUnsafe<any[]>(`SELECT * FROM public.suppliers${where} ORDER BY ${this.has(cols,'created_at') ? 'created_at' : 'id'} DESC`, ...(where ? [companyId] : []));
    return result.map(r => this.map(r));
  }
  private map(row: any) {
    return jsonSafe({ ...row, id: String(row.id), companyId: row.company_id == null ? undefined : String(row.company_id), supplierCode: row.supplier_code ?? null, supplierName: row.supplier_name ?? '', name: row.supplier_name ?? '', companyName: row.company_name ?? null, email: row.email ?? null, phone: row.phone ?? null, mobile: row.mobile ?? null, taxNumber: row.tax_number ?? null, address: row.address ?? row.billing_address ?? null, createdAt: row.created_at ?? null });
  }
  async list(token: string, companyId: string) { companyId = await this.verify(token); return this.rows(companyId); }
  private async insertData(companyId: string, body: any, cols: Col[]) {
    const name = String(body.supplierName ?? body.name ?? '').trim();
    if (!name) throw new BadRequestException('Supplier name is required');
    const values: Record<string, any> = { company_id: companyId, supplier_name: name, email: body.email ? String(body.email).trim() : null, phone: body.phone ? String(body.phone).trim() : null, mobile: body.mobile ? String(body.mobile).trim() : null, tax_number: body.taxNumber ? String(body.taxNumber).trim() : null, address: body.address ? String(body.address).trim() : null, billing_address: body.address ? String(body.address).trim() : null };
    if (this.has(cols,'supplier_code') && !body.supplierCode) values.supplier_code = `SUP-${Date.now()}`;
    const entries = Object.entries(values).filter(([k,v]) => this.has(cols,k) && v !== undefined);
    const missing = cols.filter(c => c.is_nullable === 'NO' && !c.column_default && c.column_name !== 'id' && !entries.some(([k])=>k===c.column_name));
    if (missing.length) throw new BadRequestException(`Required supplier fields missing: ${missing.map(c=>c.column_name).join(', ')}`);
    return entries;
  }
  async create(token: string, companyId: string, body: any) {
    companyId = await this.verify(token); const cols = await this.columns(); const entries = await this.insertData(companyId, body, cols);
    const names = entries.map(([k])=>`"${k}"`).join(', '); const params = entries.map(([k],i)=>k === 'company_id' ? `$${i+1}::${this.cast(cols,'company_id')}` : `$${i+1}`).join(', ');
    const result = await this.db.$queryRawUnsafe<any[]>(`INSERT INTO public.suppliers (${names}) VALUES (${params}) RETURNING *`, ...entries.map(([,v])=>v));
    return this.map(result[0]);
  }
  async update(token: string, companyId: string, id: string, body: any) {
    companyId = await this.verify(token); const cols = await this.columns(); if (!this.has(cols, 'company_id')) throw new BadRequestException('public.suppliers.company_id is required for tenant isolation');
    const idCast=this.cast(cols,'id'), companyCast=this.cast(cols,'company_id'); this.validateId(id,idCast);
    const current = await this.db.$queryRawUnsafe<any[]>(`SELECT * FROM public.suppliers WHERE id = $1::${idCast}${this.has(cols,'company_id')?` AND company_id = $2::${companyCast}`:''} LIMIT 1`, ...(this.has(cols,'company_id')?[id,companyId]:[id]));
    if (!current.length) throw new NotFoundException('Supplier not found');
    const suppliedName = body.supplierName !== undefined ? body.supplierName : body.name;
    if (suppliedName !== undefined && !String(suppliedName).trim()) throw new BadRequestException('Supplier name is required');
    const fields: Record<string,any> = { supplier_name: suppliedName === undefined ? undefined : String(suppliedName).trim(), email: body.email === undefined ? undefined : (body.email || null), phone: body.phone === undefined ? undefined : (body.phone || null), mobile: body.mobile === undefined ? undefined : (body.mobile || null), tax_number: body.taxNumber === undefined ? undefined : (body.taxNumber || null), address: body.address === undefined ? undefined : (body.address || null), billing_address: body.address === undefined ? undefined : (body.address || null) };
    const entries = Object.entries(fields).filter(([k,v])=>v!==undefined && this.has(cols,k));
    if (!entries.length) return this.map(current[0]);
    const params = entries.map(([k],i)=>`"${k}" = $${i+1}`); const values = entries.map(([,v])=>v); values.push(id);
    let where = `id = $${values.length}::${idCast}`; if (this.has(cols,'company_id')) { values.push(companyId); where += ` AND company_id = $${values.length}::${companyCast}`; }
    const result = await this.db.$queryRawUnsafe<any[]>(`UPDATE public.suppliers SET ${params.join(', ')} WHERE ${where} RETURNING *`, ...values);
    return this.map(result[0]);
  }
  async remove(token: string, companyId: string, id: string) {
    companyId = await this.verify(token); const cols = await this.columns(); if (!this.has(cols, 'company_id')) throw new BadRequestException('public.suppliers.company_id is required for tenant isolation'); const idCast=this.cast(cols,'id'), companyCast=this.cast(cols,'company_id'); this.validateId(id,idCast); const values: any[] = [id]; let where = `id = $1::${idCast}`;
    if (this.has(cols,'company_id')) { values.push(companyId); where += ` AND company_id = $2::${companyCast}`; }
    const result = await this.db.$queryRawUnsafe<any[]>(`DELETE FROM public.suppliers WHERE ${where} RETURNING id`, ...values);
    if (!result.length) throw new NotFoundException('Supplier not found');
    return { success: true, message: 'Supplier deleted' };
  }
}
