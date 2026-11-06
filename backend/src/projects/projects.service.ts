import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
@Injectable()
export class ProjectsService {
 constructor(private db:PrismaService,private jwt:JwtService){}
 private async context(token:string,headerCompanyId?:string){
  let claims:any; try{claims=await this.jwt.verifyAsync(token,{secret:process.env.JWT_ACCESS_SECRET});}catch{throw new UnauthorizedException('Invalid or expired session');}
  const companyId=headerCompanyId||claims.companyId; if(!companyId)throw new ForbiddenException('Company context required');
  const membership=await this.db.companyUser.findUnique({where:{companyId_userId:{companyId,userId:claims.sub}},include:{role:{include:{permissions:{include:{permission:true}}}}}});
  if(!membership||membership.status!=='ACTIVE')throw new ForbiddenException('Company access denied');
  const role=membership.role?.key||''; const permissions=membership.role?.permissions.map(x=>x.permission.key)||[];
  return {userId:claims.sub,companyId,canViewAll:['company_owner','company_admin','super_admin'].includes(role)||permissions.includes('project.view_all'),canManage:['company_owner','company_admin','super_admin'].includes(role)||permissions.includes('project.manage')};
 }
 async list(token:string,companyId?:string){const c=await this.context(token,companyId);return this.db.project.findMany({where:{companyId:c.companyId,...(c.canViewAll?{}:{members:{some:{userId:c.userId}}})},include:{owner:{select:{id:true,firstName:true,lastName:true,email:true}},members:{include:{user:{select:{id:true,firstName:true,lastName:true,email:true}}}},tasks:true,milestones:true,activities:{orderBy:{createdAt:'desc'},take:25}},orderBy:{updatedAt:'desc'}});}
 async summary(token:string,companyId?:string){const c=await this.context(token,companyId);const where={companyId:c.companyId,...(c.canViewAll?{}:{members:{some:{userId:c.userId}}})};const [total,active,completed,onHold]=await Promise.all([this.db.project.count({where}),this.db.project.count({where:{...where,status:'ACTIVE'}}),this.db.project.count({where:{...where,status:'COMPLETED'}}),this.db.project.count({where:{...where,status:'ON_HOLD'}})]);return {total,active,completed,onHold,visibility:c.canViewAll?'all_company_projects':'assigned_projects'};}
 async create(token:string,companyId:string|undefined,body:any){const c=await this.context(token,companyId);if(!c.canManage)throw new ForbiddenException('Project management permission required');if(!body?.name||!body?.code)throw new ForbiddenException('Project name and code are required');return this.db.project.create({data:{companyId:c.companyId,ownerId:c.userId,name:String(body.name),code:String(body.code),description:body.description?String(body.description):undefined,status:body.status||'PLANNING',priority:body.priority||'MEDIUM',startDate:body.startDate?new Date(body.startDate):undefined,dueDate:body.dueDate?new Date(body.dueDate):undefined,budget:body.budget!==undefined?String(body.budget):undefined,progress:Math.min(100,Math.max(0,Number(body.progress)||0)),members:{create:{userId:c.userId,projectRole:'manager'}}}});}
}
