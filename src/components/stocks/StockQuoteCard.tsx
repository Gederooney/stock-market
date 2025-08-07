'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StockQuoteCardProps {
  symbol: string;
}

export function StockQuoteCard({ symbol }: StockQuoteCardProps) {
  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch quote');
      return response.json();
    },
    enabled: !!symbol,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quote) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-500">
          Failed to load quote for {symbol}
        </CardContent>
      </Card>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{quote.symbol}</span>
          <span className="text-sm font-normal text-gray-500">
            {quote.lastTradingDay}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(quote.price)}</span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{formatCurrency(quote.change)}
              </span>
              <span className="text-sm">({quote.changePercent})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Open
            </p>
            <p className="font-semibold">{formatCurrency(quote.open)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Previous Close</p>
            <p className="font-semibold">{formatCurrency(quote.previousClose)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">High</p>
            <p className="font-semibold text-green-600">{formatCurrency(quote.high)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Low</p>
            <p className="font-semibold text-red-600">{formatCurrency(quote.low)}</p>
          </div>

          <div className="space-y-1 col-span-2">
            <p className="text-sm text-gray-500">Volume</p>
            <p className="font-semibold">{formatNumber(quote.volume)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}