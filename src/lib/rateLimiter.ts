import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://localhost',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

// Different rate limiters for different purposes
export const rateLimiters = {
  // General API rate limit: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Strict auth rate limit: 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Stock API rate limit: 30 requests per minute (Alpha Vantage limit)
  stockApi: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:stock',
  }),

  // Portfolio operations: 50 requests per minute
  portfolio: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
    prefix: 'ratelimit:portfolio',
  }),
};

// In-memory fallback for development
class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now();
    const key = identifier;
    const record = this.requests.get(key);

    if (!record || now > record.resetAt) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + window,
      });
      return { success: true, remaining: limit - 1, reset: now + window };
    }

    if (record.count >= limit) {
      return { 
        success: false, 
        remaining: 0, 
        reset: record.resetAt,
        retryAfter: Math.ceil((record.resetAt - now) / 1000)
      };
    }

    record.count++;
    return { 
      success: true, 
      remaining: limit - record.count, 
      reset: record.resetAt 
    };
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

// Helper function to get identifier from request
export function getIdentifier(request: NextRequest): string {
  // Try to get user ID from session
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1';
  return `ip:${ip}`;
}

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters = 'api'
): Promise<NextResponse> {
  const identifier = getIdentifier(request);

  try {
    // Use Upstash if configured, otherwise use in-memory
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const result = await rateLimiters[limiterType].limit(identifier);
      
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.reset).toISOString(),
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      const response = await handler();
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
      
      return response;
    } else {
      // Use in-memory rate limiter for development
      const limits = {
        api: { limit: 100, window: 60000 },
        auth: { limit: 5, window: 900000 },
        stockApi: { limit: 30, window: 60000 },
        portfolio: { limit: 50, window: 60000 },
      };

      const { limit, window } = limits[limiterType];
      const result = await inMemoryLimiter.limit(identifier, limit, window);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter!.toString(),
            },
          }
        );
      }

      return handler();
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request through
    return handler();
  }
}

// Hook for client-side rate limit tracking
export function useRateLimitHeaders(response: Response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  return {
    limit: limit ? parseInt(limit) : null,
    remaining: remaining ? parseInt(remaining) : null,
    reset: reset ? new Date(reset) : null,
    isLimited: remaining === '0',
  };
}