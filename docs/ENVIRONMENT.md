# Environment Variables Management

## Overview

This project uses a robust environment variable management system with:
- **Type-safe validation** using Zod
- **Real-time status monitoring** in development
- **Automatic validation** on startup
- **Helpful error messages** and warnings

## Required Variables

### Database
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?schema=public`
  - Required for all environments

### Authentication
- `AUTH_SECRET`: Secret key for NextAuth session encryption
  - Generate with: `openssl rand -base64 32`
  - Minimum 32 characters
  - Required for all environments

- `NEXTAUTH_URL`: Canonical URL of your site
  - Development: `http://localhost:3000`
  - Production: Your production URL
  - Optional (auto-detected on Vercel)

### External APIs
- `ALPHA_VANTAGE_API_KEY`: API key for stock market data
  - Get free key at: https://www.alphavantage.co/support/#api-key
  - Defaults to 'demo' for testing

## Optional Variables

### Deployment
- `VERCEL_URL`: Automatically set by Vercel
- `VERCEL_ENV`: Deployment environment (production/preview/development)
- `NODE_ENV`: Node environment (development/test/production)

## Setup Guide

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/stockmarket"
   AUTH_SECRET="your-generated-secret-here"
   ALPHA_VANTAGE_API_KEY="your-api-key"
   ```

3. **Verify configuration**:
   - Run `pnpm dev`
   - Check the environment status indicator (bottom-right corner)
   - Green = All good
   - Yellow = Warnings (missing optional vars)
   - Red = Errors (missing required vars)

## Development Features

### Environment Status Indicator
In development mode, a floating button appears in the bottom-right corner:
- **Green checkmark**: All variables valid
- **Yellow warning**: Some optional variables missing
- **Red X**: Required variables missing or invalid

Click the button to see detailed status information.

### API Endpoint
Check environment status programmatically:
```
GET /api/env/status
```

Returns:
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Missing: VERCEL_URL"],
  "environment": "development"
}
```

## Type-Safe Access

### Server-side
```typescript
import { env, getEnv, getEnvOrThrow } from '@/lib/env';

// Get with fallback
const apiKey = getEnv('ALPHA_VANTAGE_API_KEY') || 'demo';

// Get required (throws if missing)
const dbUrl = getEnvOrThrow('DATABASE_URL');

// Check environment
if (env.isProduction()) {
  // Production-only code
}
```

### Client-side
```typescript
import { useEnv } from '@/hooks/useEnv';

function MyComponent() {
  const { env, isDevelopment } = useEnv();
  
  if (isDevelopment) {
    // Show dev-only features
  }
}
```

## Testing

Run Playwright tests to verify environment setup:
```bash
pnpm test
```

View test results with UI:
```bash
pnpm test:ui
```

## Troubleshooting

### Common Issues

1. **"Environment validation failed" on startup**
   - Check all required variables are set
   - Verify DATABASE_URL format
   - Ensure AUTH_SECRET is at least 32 characters

2. **Authentication not working**
   - Verify AUTH_SECRET is set
   - Check NEXTAUTH_URL matches your site URL
   - Ensure database is running and accessible

3. **Stock data not loading**
   - Check ALPHA_VANTAGE_API_KEY is valid
   - Note: 'demo' key has strict rate limits

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different secrets per environment**
   - Don't reuse AUTH_SECRET between dev/staging/prod
   - Rotate secrets regularly

3. **Limit access to production variables**
   - Use environment-specific secrets
   - Store in secure vaults (Vercel, AWS Secrets Manager, etc.)

4. **Validate on startup**
   - Our system validates all variables on app start
   - Fails fast in production if misconfigured