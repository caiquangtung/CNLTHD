import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.database'),
  
  // Entities
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Synchronize: CHỈ dùng trong development
  synchronize: configService.get<string>('nodeEnv') === 'development',
  
  // Logging
  logging: configService.get<string>('nodeEnv') === 'development',
  
  // Connection Pool (theo DATABASE_OPTIMIZATION.md)
  extra: {
    max: 20,                      // Maximum connections
    min: 5,                       // Minimum connections
    idleTimeoutMillis: 30000,     // 30 seconds
    connectionTimeoutMillis: 2000, // 2 seconds
  },
  
  // Migrations
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  migrationsRun: false,
});
