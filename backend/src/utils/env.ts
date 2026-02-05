import dotenv from 'dotenv';

dotenv.config();

interface Env {
  APP_ENV: string;
  CORS_ORIGIN: string | string[] | true;
  CORS_METHODS: string;
  LISTENING_PORT: number;
  LIMITER_LIMIT: number;
  LIMITER_WINDOW: number;
  DEV_FAKE_USER_ID: string | null;
  DATABASE_URL: string;
}

const getv = (name: string, def: string): string => process.env[name] ?? def;

const rawOrigin = getv('CORS_ORIGIN', '*');
const corsOrigin = rawOrigin === '*' ? true : rawOrigin.split(',').map(s => s.trim());

const env: Env = {
  APP_ENV: getv('APP_ENV', 'dev'),
  CORS_ORIGIN: corsOrigin,
  CORS_METHODS: getv('CORS_METHODS', 'GET,POST,DELETE,PUT,PATCH'),
  LISTENING_PORT: parseInt(getv('LISTENING_PORT', '3000'), 10),
  LIMITER_LIMIT: parseInt(getv('LIMITER_LIMIT', '100'), 10),
  LIMITER_WINDOW: parseInt(getv('LIMITER_WINDOW', '60'), 10),
  DEV_FAKE_USER_ID: getv('DEV_FAKE_USER_ID', '') || null,
  DATABASE_URL: getv('DATABASE_URL', 'mysql://user:password@localhost:3306/spider'),
};

export default env;
