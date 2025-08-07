'use client';

import { useState } from 'react';
import { StockSearch } from '@/components/stocks/StockSearch';
import { StockQuoteCard } from '@/components/stocks/StockQuoteCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState<any>(null);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Stock Search</h1>
        <p className="text-gray-600 mt-2">
          Search for stocks and view real-time quotes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Search Stocks</CardTitle>
              <CardDescription>
                Enter a stock symbol or company name to search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockSearch
                onSelectStock={(stock) => setSelectedStock(stock)}
              />
              
              {selectedStock && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold mb-2">Selected Stock</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Symbol:</span> {selectedStock.symbol}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {selectedStock.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {selectedStock.type}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Region:</span> {selectedStock.region}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedStock ? (
            <StockQuoteCard symbol={selectedStock.symbol} />
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-gray-500">
                Select a stock to view its quote
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}