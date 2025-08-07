'use client';

import { useParams } from 'next/navigation';
import { usePortfolio } from '@/hooks/usePortfolios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const { data: portfolio, isLoading, error } = usePortfolio(portfolioId, true);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Failed to load portfolio</p>
            <Link href="/portfolios">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/portfolios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolios
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{portfolio.name}</CardTitle>
                {portfolio.description && (
                  <CardDescription className="mt-2">
                    {portfolio.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/portfolios/${portfolioId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {portfolio.stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(portfolio.stats.totalValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Cost</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(portfolio.stats.totalCost)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Profit/Loss</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {portfolio.stats.profitLoss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <p
                    className={`text-2xl font-bold ${
                      portfolio.stats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(Math.abs(portfolio.stats.profitLoss))}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Return %</CardDescription>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    portfolio.stats.profitLossPercentage >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {portfolio.stats.profitLossPercentage >= 0 ? '+' : ''}
                  {portfolio.stats.profitLossPercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Positions</CardTitle>
              <Link href={`/portfolios/${portfolioId}/add-position`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Position
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {portfolio.positions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No positions yet</p>
                <Link href={`/portfolios/${portfolioId}/add-position`}>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Position
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.positions.map((position) => (
                  <div
                    key={position.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{position.stock.symbol}</p>
                      <p className="text-sm text-gray-500">
                        {position.quantity} shares @ {formatCurrency(position.averagePrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(position.quantity * position.averagePrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}