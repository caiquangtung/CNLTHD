import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Config Service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  
  // Global Prefix
  app.setGlobalPrefix('api');
  
  // CORS
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
    credentials: true,
  });
  
  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Response Transformer (wraps all responses in standard format)
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Global Exception Filters (catches all errors and formats them)
  app.useGlobalFilters(
    new AllExceptionsFilter(), // Catch-all for unhandled errors
    new HttpExceptionFilter(),  // HTTP exceptions
  );
  
  // Swagger Documentation
  if (configService.get<boolean>('swagger.enabled')) {
    const config = new DocumentBuilder()
      .setTitle('Event Booking API')
      .setDescription('API for Event Booking System - NestJS + TypeORM + PostgreSQL')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('events', 'Event management')
      .addTag('bookings', 'Booking system')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = configService.get<string>('swagger.path');
    SwaggerModule.setup(swaggerPath, app, document);
  }
  
  await app.listen(port);
  
  console.log('\n🚀 ========================================');
  console.log(`🎯 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${configService.get<string>('nodeEnv')}`);
  console.log('========================================\n');
}

bootstrap();
