import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/infrastructure/external/AlphaVantageClient';
import { z } from 'zod';

const alphaVantageClient = new AlphaVantageClient();

const searchSchema = z.object({
  q: z.string().min(1).max(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const validated = searchSchema.parse({ q: query });
    const results = await alphaVantageClient.searchSymbols(validated.q);

    // Transform the results to a cleaner format
    const stocks = results.map((stock: any) => ({
      symbol: stock['1. symbol'],
      name: stock['2. name'],
      type: stock['3. type'],
      region: stock['4. region'],
      marketOpen: stock['5. marketOpen'],
      marketClose: stock['6. marketClose'],
      timezone: stock['7. timezone'],
      currency: stock['8. currency'],
      matchScore: stock['9. matchScore'],
    }));

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Stock search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search query' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}