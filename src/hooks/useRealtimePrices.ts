import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface RealtimePriceOptions {
  symbols: string[];
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export function useRealtimePrices({
  symbols,
  interval = 60000, // Default to 1 minute
  enabled = true,
}: RealtimePriceOptions) {
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<Record<string, number>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['realtime-prices', symbols],
    queryFn: async () => {
      const pricePromises = symbols.map(async (symbol) => {
        const response = await fetch(`/api/stocks/quote?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
        const data = await response.json();
        return { symbol, price: data.price };
      });

      const results = await Promise.allSettled(pricePromises);
      const priceMap: Record<string, number> = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          priceMap[result.value.symbol] = result.value.price;
        }
      });

      return priceMap;
    },
    enabled: enabled && symbols.length > 0,
    refetchInterval: interval,
    staleTime: interval / 2,
  });

  useEffect(() => {
    if (data) {
      setPrices(data);
    }
  }, [data]);

  return {
    prices,
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['realtime-prices', symbols] }),
  };
}

export function usePriceUpdates(symbol: string, onUpdate?: (price: number) => void) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch quote');
      return response.json();
    },
    enabled: !!symbol,
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 15000,
  });

  useEffect(() => {
    if (quote?.price && quote.price !== currentPrice) {
      setPreviousPrice(currentPrice);
      setCurrentPrice(quote.price);
      onUpdate?.(quote.price);
    }
  }, [quote, currentPrice, onUpdate]);

  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : 0;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  return {
    currentPrice,
    previousPrice,
    priceChange,
    priceChangePercent,
    isLoading,
    isUpdating: currentPrice !== quote?.price,
  };
}