import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SaleAgentsService } from './sale-agents.service';
@ApiTags('Sale Agents') @ApiBearerAuth() @Controller('sale-agents')
export class SaleAgentsController {
 constructor(private readonly service: SaleAgentsService) {}
 private token(v?:string){if(!v?.startsWith('Bearer '))throw new UnauthorizedException('Bearer token required');return v.slice(7)}
 @Get() list(@Headers('authorization') a:string){return this.service.list(this.token(a))}
 @Post() create(@Headers('authorization') a:string,@Body() b:any){return this.service.create(this.token(a),b)}
 @Patch(':id') update(@Headers('authorization') a:string,@Param('id') id:string,@Body() b:any){return this.service.update(this.token(a),id,b)}
 @Delete(':id') remove(@Headers('authorization') a:string,@Param('id') id:string){return this.service.remove(this.token(a),id)}
}
