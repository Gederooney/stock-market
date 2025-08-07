import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/infrastructure/external/AlphaVantageClient';
import { z } from 'zod';

const alphaVantageClient = new AlphaVantageClient();

const paramsSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
});

const querySchema = z.object({
  interval: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const validatedParams = paramsSchema.parse(params);
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || 'daily';

    const validatedQuery = querySchema.parse({ interval });

    let data;
    switch (validatedQuery.interval) {
      case 'daily':
        data = await alphaVantageClient.getDailyTimeSeries(validatedParams.symbol);
        break;
      case 'weekly':
        // For demo, using daily data
        data = await alphaVantageClient.getDailyTimeSeries(validatedParams.symbol);
        break;
      case 'monthly':
        // For demo, using daily data
        data = await alphaVantageClient.getDailyTimeSeries(validatedParams.symbol);
        break;
    }

    // Transform the time series data
    const timeSeries = data['Time Series (Daily)'] || {};
    const history = Object.entries(timeSeries)
      .slice(0, 30) // Last 30 data points
      .map(([date, values]: [string, any]) => ({
        date,
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
      history,
    });
  } catch (error) {
    console.error('Stock history error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}