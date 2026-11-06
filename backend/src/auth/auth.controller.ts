import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SelectCompanyDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('select-company') @ApiBearerAuth()
  async selectCompany(@Body() dto: SelectCompanyDto, @Headers('authorization') authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Bearer access token required');
    const claims = await this.auth.verifyAccessToken(token);
    return this.auth.selectCompany(claims.sub, dto.companyId);
  }
}
