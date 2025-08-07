import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';

interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: string;
  lastTradingDay: string;
}

export function useStockSearch(query: string, enabled = true) {
  return useQuery<StockSearchResult[]>({
    queryKey: ['stock-search', query],
    queryFn: async () => {
      if (!query) return [];
      
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      return response.json();
    },
    enabled: enabled && query.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useStockQuote(symbol: string | null) {
  return useQuery<StockQuote>({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('No symbol provided');
      
      const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock quote');
      }
      return response.json();
    },
    enabled: !!symbol,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

export function useDebouncedSearch(delay = 500) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  };
}