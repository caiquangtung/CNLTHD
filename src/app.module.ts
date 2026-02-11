import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Config Module - Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    
    // TypeORM Module - Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    
    // Schedule Module - For cleanup jobs
    ScheduleModule.forRoot(),
    
    UsersModule,
    
    AuthModule,
    
    // Feature Modules (will add later)
    // UsersModule,
    // AuthModule,
    // EventsModule,
    // BookingsModule,
    // OrdersModule,
    // PaymentsModule,
    // TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
