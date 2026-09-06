import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory and project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'coop-itsm-jwt-super-secret-key-2026-oromia',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3003',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://coop_user:coop_pass@localhost:5435/coop_itsm_db?schema=public',
};

export const isDev = config.nodeEnv === 'development';
export const isProd = config.nodeEnv === 'production';
