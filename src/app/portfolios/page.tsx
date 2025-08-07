import { Metadata } from 'next';
import { PortfolioList } from '@/components/portfolios/PortfolioList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolios - Stock Market Dashboard',
  description: 'Manage your investment portfolios',
};

export default function PortfoliosPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Portfolios</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your investment portfolios
          </p>
        </div>
        <Link href="/portfolios/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </Link>
      </div>

      <PortfolioList />
    </div>
  );
}