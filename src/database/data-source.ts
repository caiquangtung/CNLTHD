import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'event_booking',
  
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  
  synchronize: false, // Always false for migrations
  logging: true,
});
