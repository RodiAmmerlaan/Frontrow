export const SERVER_CONFIG = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001'
};

export const JWT_CONFIG = {
  ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  REFRESH_TTL_DAYS: Number(process.env.REFRESH_TTL_DAYS) || 30
};

export const DATABASE_CONFIG = {
  URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/database'
};

export const LOGGING_CONFIG = {
  LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
};

export default {
  SERVER_CONFIG,
  JWT_CONFIG,
  DATABASE_CONFIG,
  LOGGING_CONFIG
};