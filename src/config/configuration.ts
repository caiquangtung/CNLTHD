export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'event_booking',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
  },
  
  swagger: {
    enabled: process.env.API_DOCS_ENABLED === 'true',
    path: process.env.API_DOCS_PATH || 'api/docs',
  },
});
