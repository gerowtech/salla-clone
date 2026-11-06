import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}
  private token(value?: string) {
    if (!value?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required');
    return value.slice(7);
  }
  @Get() list(@Headers('authorization') a: string, @Headers('x-company-id') c: string) { return this.service.list(this.token(a), c); }
  @Post() create(@Headers('authorization') a: string, @Headers('x-company-id') c: string, @Body() b: any) { return this.service.create(this.token(a), c, b); }
  @Patch(':id') update(@Headers('authorization') a: string, @Headers('x-company-id') c: string, @Param('id') id: string, @Body() b: any) { return this.service.update(this.token(a), c, id, b); }
  @Delete(':id') remove(@Headers('authorization') a: string, @Headers('x-company-id') c: string, @Param('id') id: string) { return this.service.remove(this.token(a), c, id); }
}
