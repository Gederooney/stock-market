'use client';

import { usePortfolios } from '@/hooks/usePortfolios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export function PortfolioList() {
  const { data: portfolios, isLoading, error } = usePortfolios();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500">Failed to load portfolios</p>
        </CardContent>
      </Card>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">No portfolios yet</p>
          <Link href="/portfolios/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((portfolio) => (
        <Link key={portfolio.id} href={`/portfolios/${portfolio.id}`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{portfolio.name}</CardTitle>
              {portfolio.description && (
                <CardDescription>{portfolio.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {portfolio.positions.length} positions
                  </span>
                </div>
                {portfolio.stats && (
                  <div className="flex items-center space-x-1">
                    {portfolio.stats.profitLoss >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        portfolio.stats.profitLoss >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {portfolio.stats.profitLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}