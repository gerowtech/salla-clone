import { BadRequestException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WhatsAppService {
  constructor(private readonly prisma: PrismaService) {}
  private key() {
    const secret = process.env.WHATSAPP_ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!secret) throw new Error('Set WHATSAPP_ENCRYPTION_KEY or JWT_SECRET in the backend environment.');
    return createHash('sha256').update(secret).digest();
  }
  private encrypt(value: string) {
    const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join('.');
  }
  private decrypt(value: string) {
    const [iv, tag, data] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', this.key(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  }
  private toCompanyId(companyId: string): bigint {
    if (!/^\d+$/.test(companyId)) {
      throw new BadRequestException('WhatsApp settings currently require a numeric company ID because whatsapp_settings.company_id is BIGINT. The UUID company ID schema must be reconciled before this feature can be used with UUID companies.');
    }
    return BigInt(companyId);
  }
  async get(companyId: string) {
    const numericCompanyId = this.toCompanyId(companyId);
    const row = await this.prisma.whatsAppSettings.findUnique({ where: { companyId: numericCompanyId } });
    return { phoneNumberId: row?.phoneNumberId || '', businessAccountId: row?.businessAccountId || '', tokenConfigured: !!row?.accessTokenEncrypted, tokenPreview: row?.accessTokenEncrypted ? '••••••••••••••••' : '' };
  }
  async save(companyId: string, input: { accessToken?: string; phoneNumberId: string; businessAccountId: string; clearToken?: boolean }) {
    if (!companyId) throw new BadRequestException('Company ID is required.');
    const numericCompanyId = this.toCompanyId(companyId);
    const current = await this.prisma.whatsAppSettings.findUnique({ where: { companyId: numericCompanyId } });
    const accessTokenEncrypted = input.clearToken ? '' : input.accessToken?.trim() ? this.encrypt(input.accessToken.trim()) : current?.accessTokenEncrypted;
    if (!accessTokenEncrypted) throw new BadRequestException('Permanent Access Token is required.');
    return this.prisma.whatsAppSettings.upsert({
      where: { companyId: numericCompanyId },
      create: { companyId: numericCompanyId, accessTokenEncrypted, phoneNumberId: input.phoneNumberId.trim(), businessAccountId: input.businessAccountId.trim() },
      update: { accessTokenEncrypted, phoneNumberId: input.phoneNumberId.trim(), businessAccountId: input.businessAccountId.trim() },
    }).then(row => ({ success: true, phoneNumberId: row.phoneNumberId, businessAccountId: row.businessAccountId, tokenConfigured: true }));
  }
}
