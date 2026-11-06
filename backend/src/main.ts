import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 app.setGlobalPrefix('api/v1');
 app.use(helmet());
 app.enableCors({ origin: [...new Set(['http://localhost:3000', 'http://localhost:3001', ...(process.env.FRONTEND_URL?.split(',') ?? [])])], credentials: true });
 app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
 const config = new DocumentBuilder().setTitle('Salla API').setDescription('SALLA WORKSPACE SaaS API').setVersion('1.0').addBearerAuth().build();
 SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
 await app.listen(process.env.API_PORT || 4001);
}
bootstrap();
