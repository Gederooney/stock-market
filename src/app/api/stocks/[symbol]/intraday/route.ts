import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/infrastructure/external/AlphaVantageClient';
import { z } from 'zod';

const alphaVantageClient = new AlphaVantageClient();

const paramsSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
});

const querySchema = z.object({
  interval: z.enum(['1min', '5min', '15min', '30min', '60min']).default('5min'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const validatedParams = paramsSchema.parse(params);
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || '5min';

    const validatedQuery = querySchema.parse({ interval });

    const data = await alphaVantageClient.getIntraday(
      validatedParams.symbol,
      validatedQuery.interval as any
    );

    // Transform the intraday data
    const timeSeries = data[`Time Series (${validatedQuery.interval})`] || {};
    const intraday = Object.entries(timeSeries)
      .slice(0, 100) // Last 100 data points
      .map(([datetime, values]: [string, any]) => ({
        datetime,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))
      .reverse(); // Chronological order

    return NextResponse.json({
      symbol: validatedParams.symbol,
      interval: validatedQuery.interval,
      intraday,
    });
  } catch (error) {
    console.error('Stock intraday error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch intraday data' },
      { status: 500 }
    );
  }
}