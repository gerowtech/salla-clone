import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehouses: WarehousesService) {}

  @Get()
  list(
    @Headers('authorization') authorization: string,
    @Headers('x-company-id') companyId: string,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token required');
    }
    return this.warehouses.listForCompany(authorization.slice(7), companyId);
  }
}
