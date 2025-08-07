import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { withRateLimit, getIdentifier } from '@/lib/rateLimiter';

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Determine rate limiter type based on route
    let limiterType: 'api' | 'auth' | 'stockApi' | 'portfolio' = 'api';
    
    if (request.nextUrl.pathname.includes('/auth')) {
      limiterType = 'auth';
    } else if (request.nextUrl.pathname.includes('/stock')) {
      limiterType = 'stockApi';
    } else if (request.nextUrl.pathname.includes('/portfolio')) {
      limiterType = 'portfolio';
    }
    
    return withRateLimit(
      request,
      async () => NextResponse.next(),
      limiterType
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/'],
};