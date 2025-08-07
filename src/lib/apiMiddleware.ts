import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from './logger';

export async function withLogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Log request
  apiLogger.info({
    type: 'request',
    requestId,
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    const response = await handler();
    const duration = Date.now() - startTime;
    
    // Log response
    apiLogger.info({
      type: 'response',
      requestId,
      statusCode: response.status,
      duration,
    });
    
    // Add request ID to response headers
    response.headers.set('X-Request-Id', requestId);
    response.headers.set('X-Response-Time', `${duration}ms`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log error
    apiLogger.error({
      type: 'error',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });
    
    throw error;
  }
}