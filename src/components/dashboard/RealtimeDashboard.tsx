'use client';

import { useRealtimePrices } from '@/hooks/useRealtimePrices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RealtimeDashboardProps {
  symbols?: string[];
}

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

export function RealtimeDashboard({ symbols = DEFAULT_SYMBOLS }: RealtimeDashboardProps) {
  const { prices, isLoading } = useRealtimePrices({
    symbols,
    interval: 30000, // Update every 30 seconds
  });

  if (isLoading && Object.keys(prices).length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {symbols.map((symbol) => (
          <Card key={symbol} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Market Overview</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 animate-pulse text-green-500" />
          <span>Live Prices</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {symbols.map((symbol) => {
          const price = prices[symbol];
          const hasPrice = price !== undefined;

          return (
            <Card
              key={symbol}
              className="hover:border-primary transition-colors cursor-pointer"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{symbol}</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasPrice ? (
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}