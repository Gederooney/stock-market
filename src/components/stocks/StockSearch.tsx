'use client';

import { useState } from 'react';
import { useStockSearch, useDebouncedSearch } from '@/hooks/useStocks';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockSearchProps {
  onSelectStock?: (stock: any) => void;
  className?: string;
}

export function StockSearch({ onSelectStock, className }: StockSearchProps) {
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(300);
  const { data: results, isLoading } = useStockSearch(debouncedTerm);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (stock: any) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
        )}
      </div>

      {isOpen && results && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{stock.symbol}</span>
                      <span className="text-sm text-gray-500">{stock.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{stock.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">{stock.region}</p>
                    <p className="text-gray-400">{stock.currency}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && debouncedTerm && results?.length === 0 && !isLoading && (
        <Card className="absolute z-50 w-full mt-2">
          <CardContent className="py-8 text-center text-gray-500">
            No stocks found for "{debouncedTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}