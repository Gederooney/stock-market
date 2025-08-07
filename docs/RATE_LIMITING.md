# Rate Limiting Documentation

## Overview

This application implements comprehensive rate limiting to:
- Protect against abuse and DDoS attacks
- Ensure fair resource usage
- Comply with external API limits (Alpha Vantage)
- Maintain application performance

## Rate Limits by Endpoint

### Authentication Endpoints
- **Limit**: 5 requests per 15 minutes
- **Endpoints**: `/api/auth/*`
- **Purpose**: Prevent brute force attacks

### General API Endpoints
- **Limit**: 100 requests per minute
- **Endpoints**: `/api/*` (except auth, stock, portfolio)
- **Purpose**: General API protection

### Stock Data Endpoints
- **Limit**: 30 requests per minute
- **Endpoints**: `/api/stock/*`
- **Purpose**: Comply with Alpha Vantage free tier limits

### Portfolio Operations
- **Limit**: 50 requests per minute
- **Endpoints**: `/api/portfolio/*`
- **Purpose**: Prevent data manipulation abuse

## Implementation

### Production (Upstash Redis)
```env
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Development (In-Memory)
Automatically falls back to in-memory rate limiting when Upstash is not configured.

## Response Headers

All rate-limited endpoints return these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:00:00.000Z
```

When rate limited:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

## Client-Side Usage

### Using the API Client Hook

```typescript
import { useApiClient } from '@/hooks/useApiClient';

function MyComponent() {
  const api = useApiClient();
  
  const fetchData = async () => {
    try {
      // Automatically handles rate limiting and retries
      const data = await api.get('/api/test/rate-limit');
      console.log(data);
    } catch (error) {
      // Error is already shown as toast
      console.error(error);
    }
  };
}
```

### Rate Limit Status Component

Add to your layout to show rate limit status:

```tsx
import { RateLimitStatus } from '@/components/RateLimitStatus';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <RateLimitStatus />
    </>
  );
}
```

## Testing Rate Limits

### Test Endpoint
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X GET http://localhost:3000/api/test/rate-limit
  sleep 0.1
done
```

### Expected Behavior
1. First 5 requests succeed (auth endpoints)
2. 6th request returns 429 with Retry-After header
3. Client automatically retries after delay
4. Visual warning shown when approaching limit

## Customization

### Adding Custom Rate Limiter

```typescript
// src/lib/rateLimiter.ts
export const rateLimiters = {
  // ... existing limiters
  
  custom: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 per hour
    analytics: true,
    prefix: 'ratelimit:custom',
  }),
};
```

### Using in API Route

```typescript
import { withRateLimit } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      // Your API logic here
      return NextResponse.json({ data: 'success' });
    },
    'custom' // Use custom rate limiter
  );
}
```

## Monitoring

### Analytics Dashboard
When using Upstash, view analytics at:
https://console.upstash.com/redis

### Metrics Tracked
- Total requests
- Blocked requests
- Unique identifiers
- Peak usage times

## Best Practices

1. **User-based limiting**: Authenticated users get higher limits
2. **IP fallback**: Anonymous users limited by IP
3. **Graceful degradation**: Service continues if Redis fails
4. **Clear feedback**: Show remaining quota to users
5. **Exponential backoff**: Automatic retry with increasing delays

## Troubleshooting

### "Too Many Requests" Errors
- Check current limits in response headers
- Wait for reset time
- Consider upgrading plan for higher limits

### Rate Limiter Not Working
- Verify Redis connection (Upstash)
- Check middleware configuration
- Ensure matcher patterns are correct

### Different Limits for Users
```typescript
// Custom identifier logic
function getIdentifier(request: NextRequest): string {
  const user = getUser(request);
  
  if (user?.plan === 'premium') {
    return `premium:${user.id}`;
  }
  
  return `basic:${user?.id || request.ip}`;
}
```