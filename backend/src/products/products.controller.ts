import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
@ApiTags('Products') @Controller('products') export class ProductsController { constructor(private service:ProductsService){} @Get() list(@Headers('x-company-id') companyId:string){if(!companyId)throw new UnauthorizedException('Company context required');return this.service.list(companyId)} @Post() create(@Headers('x-company-id') companyId:string,@Body() body:any){if(!companyId)throw new UnauthorizedException('Company context required');return this.service.create(companyId,body)} }
