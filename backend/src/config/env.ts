import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Email Service - SMTP (Gmail, etc.) OR SendGrid
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.string().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASS: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('noreply@eventsuite.com'),
    EMAIL_FROM_NAME: z.string().default('Event Management Suite'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'STRIPE_PUBLISHABLE_KEY is required'),
    STRIPE_WEBHOOK_SECRET: z.string().optional(), // Optional for local development without webhooks
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}

export const env = _env.data;
