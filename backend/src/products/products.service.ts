import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
@Injectable() export class ProductsService { constructor(private db:PrismaService){} list(companyId:string){return this.db.product.findMany({where:{companyId},orderBy:{createdAt:'desc'},take:100})} create(companyId:string,data:any){return this.db.product.create({data:{companyId,sku:data.sku,name:data.name,description:data.description,costPrice:data.costPrice,salePrice:data.salePrice,barcode:data.barcode,unit:data.unit||'pcs'}})} }
