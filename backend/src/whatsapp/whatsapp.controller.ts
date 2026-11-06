import { Body, Controller, Get, Headers, Put, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
@ApiTags('WhatsApp')
@Controller('whatsapp/settings')
export class WhatsAppController {
  constructor(private readonly service: WhatsAppService) {}
  private company(headers: Record<string, string>) { const id = headers['x-company-id']; if (!id) throw new UnauthorizedException('Select a company before managing WhatsApp settings.'); return id; }
  @Get() get(@Headers() headers: Record<string, string>) { return this.service.get(this.company(headers)); }
  @Put() save(@Headers() headers: Record<string, string>, @Body() body: { accessToken?: string; phoneNumberId: string; businessAccountId: string; clearToken?: boolean }) { return this.service.save(this.company(headers), body); }
}
