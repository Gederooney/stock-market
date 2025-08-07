import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // NextAuth
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Alpha Vantage API
  ALPHA_VANTAGE_API_KEY: z.string().default('demo'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Vercel
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
});

type Env = z.infer<typeof envSchema>;

class EnvironmentManager {
  private env: Env | null = null;
  private validationErrors: z.ZodError | null = null;

  constructor() {
    this.validate();
  }

  private validate() {
    try {
      this.env = envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || this.getNextAuthUrl(),
        ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_ENV: process.env.VERCEL_ENV,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.validationErrors = error;
        if (process.env.NODE_ENV === 'production') {
          console.error('Environment validation failed:', error.flatten());
          throw new Error('Invalid environment configuration');
        } else {
          console.warn('Environment validation warnings:', error.flatten());
        }
      }
    }
  }

  private getNextAuthUrl(): string {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
  }

  get(key: keyof Env): string | undefined {
    if (!this.env) {
      throw new Error('Environment not initialized');
    }
    return this.env[key];
  }

  getOrThrow(key: keyof Env): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  getValidationErrors(): z.ZodError | null {
    return this.validationErrors;
  }

  getPublicEnv() {
    return {
      NEXT_PUBLIC_APP_URL: this.get('NEXTAUTH_URL'),
      NEXT_PUBLIC_ENVIRONMENT: this.get('NODE_ENV'),
    };
  }
}

export const env = new EnvironmentManager();

// Type-safe environment variable access
export const getEnv = (key: keyof Env) => env.get(key);
export const getEnvOrThrow = (key: keyof Env) => env.getOrThrow(key);