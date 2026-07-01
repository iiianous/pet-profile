import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const MONGO_URI = requiredEnv('MONGO_URI');
export const JWT_SECRET = requiredEnv('JWT_SECRET');
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '1d';
export const COOKIE_SECURE = NODE_ENV === 'production';
export const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_MAX = 100;
export const AUTH_RATE_LIMIT_MAX = 20;
