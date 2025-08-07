'use client';

import { useParams } from 'next/navigation';
import { StockQuoteCard } from '@/components/stocks/StockQuoteCard';
import { StockPriceChart } from '@/components/stocks/StockPriceChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/stocks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stock Search
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockPriceChart symbol={symbol} />
        </div>
        <div>
          <StockQuoteCard symbol={symbol} />
        </div>
      </div>
    </div>
  );
}