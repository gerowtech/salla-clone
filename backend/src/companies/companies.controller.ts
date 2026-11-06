import { Controller, Get, Headers, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
@ApiTags('Companies') @Controller('companies')
export class CompaniesController { constructor(private service:CompaniesService){} @Get() list(@Headers('x-user-id') userId:string){if(!userId)throw new UnauthorizedException('Authentication required');return this.service.list(userId)} @Post('select') select(@Headers('x-user-id') userId:string,@Body('companyId') companyId:string){if(!userId)throw new UnauthorizedException();return this.service.select(userId,companyId)} }
