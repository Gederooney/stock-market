import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const validationErrors = env.getValidationErrors();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (validationErrors) {
    validationErrors.errors.forEach(err => {
      const message = `${err.path.join('.')}: ${err.message}`;
      if (err.code === 'invalid_type' && err.received === 'undefined') {
        warnings.push(`Missing: ${err.path.join('.')}`);
      } else {
        errors.push(message);
      }
    });
  }

  return NextResponse.json({
    isValid: errors.length === 0,
    errors,
    warnings,
    environment: env.get('NODE_ENV') || 'development',
  });
}