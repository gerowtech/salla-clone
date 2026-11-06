import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
@ApiTags('Projects') @ApiBearerAuth() @Controller('projects')
export class ProjectsController {
 constructor(private service:ProjectsService){}
 @Get() list(@Headers('authorization') auth:string,@Headers('x-company-id') companyId:string){if(!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required'); return this.service.list(auth.slice(7),companyId);}
 @Get('summary') summary(@Headers('authorization') auth:string,@Headers('x-company-id') companyId:string){if(!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required'); return this.service.summary(auth.slice(7),companyId);}
 @Post() create(@Headers('authorization') auth:string,@Headers('x-company-id') companyId:string,@Body() body:any){if(!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required'); return this.service.create(auth.slice(7),companyId,body);}
}
