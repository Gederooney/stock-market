import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // The rate limiting is handled by middleware
  // This endpoint is just for testing
  
  return NextResponse.json({
    message: 'Request successful',
    timestamp: new Date().toISOString(),
    info: 'Check response headers for rate limit information',
  });
}

export async function POST(request: NextRequest) {
  // Simulate some processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const body = await request.json().catch(() => ({}));
  
  return NextResponse.json({
    message: 'Data received',
    received: body,
    timestamp: new Date().toISOString(),
  });
}