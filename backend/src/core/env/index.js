import env from 'dotenv';

env.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'http://localhost:3000';
export const API_PUBLIC_URL = process.env.API_PUBLIC_URL || HOST;
export const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
export const CORS_ORIGINS = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || FRONTEND_URL)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
export const CORS_ORIGIN = CORS_ORIGINS;
export const TRUST_PROXY = process.env.TRUST_PROXY === 'true';
export const { JWT_SECRET } = process.env;
export const EXPIRE_DAYS = process.env.EXPIRE_DAYS || '1d';
export const { JWT_REFRESH_SECRET } = process.env;
export const REFRESH_EXPIRE_DAYS = process.env.REFRESH_EXPIRE_DAYS || '7d';
export const { DATABASE_URL } = process.env;
export const { MONGO_URL } = process.env;
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || '';
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '';
export const ROOT_DIR =
    NODE_ENV === 'production'
        ? `${process.cwd()}/dist`
        : `${process.cwd()}/src`;
export const CLOUDINARY_NAME =
    process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
export const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
export const SALT_ROUNDS = Number.parseInt(process.env.SALT_ROUNDS || '10', 10);
export const { SENTRY_DSN } = process.env;
export const DISCORD = {
    WEBHOOK: process.env.DISCORD_WEBHOOK,
    BOT_NAME: process.env.DISCORD_BOT_NAME,
    BOT_AVATAR_URL: process.env.DISCORD_BOT_AVATAR_URL,
};

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are required');
}

if (NODE_ENV === 'production') {
    const hasDatabaseUrl = Boolean(DATABASE_URL);
    const requiredProductionEnv = hasDatabaseUrl
        ? ['FRONTEND_URL']
        : ['DB_TYPE', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME', 'FRONTEND_URL'];

    const missing = requiredProductionEnv.filter(key => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    }
}
