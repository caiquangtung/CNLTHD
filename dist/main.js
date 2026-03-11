"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const interceptors_1 = require("./common/interceptors");
const filters_1 = require("./common/filters");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port');
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: configService.get('cors.origin'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new interceptors_1.TransformResponseInterceptor());
    app.useGlobalFilters(new filters_1.AllExceptionsFilter(), new filters_1.HttpExceptionFilter());
    if (configService.get('swagger.enabled')) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Event Booking API')
            .setDescription('API for Event Booking System - NestJS + TypeORM + PostgreSQL')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management')
            .addTag('events', 'Event management')
            .addTag('bookings', 'Booking system')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        const swaggerPath = configService.get('swagger.path');
        swagger_1.SwaggerModule.setup(swaggerPath, app, document);
    }
    await app.listen(port);
    console.log('\n🚀 ========================================');
    console.log(`🎯 Application is running on: http://localhost:${port}/api`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    console.log(`🌍 Environment: ${configService.get('nodeEnv')}`);
    console.log('========================================\n');
}
bootstrap();
//# sourceMappingURL=main.js.map