import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/infrastructure/external/AlphaVantageClient';
import { z } from 'zod';

const alphaVantageClient = new AlphaVantageClient();

const quoteSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    const validated = quoteSchema.parse({ symbol });
    const quote = await alphaVantageClient.getQuote(validated.symbol);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Stock quote error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid stock symbol' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    );
  }
}