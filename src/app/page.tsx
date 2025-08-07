'use client';

import { TrendingUp, DollarSign, Activity, PieChart } from 'lucide-react';
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold">Stock Market Dashboard</h1>
            </div>
            <nav className="flex gap-6">
              <Link href="/stocks" className="hover:text-green-600 transition-colors">Stocks</Link>
              <Link href="/portfolios" className="hover:text-green-600 transition-colors">Portfolios</Link>
              <Link href="/watchlist" className="hover:text-green-600 transition-colors">Watchlist</Link>
              <Link href="/alerts" className="hover:text-green-600 transition-colors">Alerts</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Total Value</span>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold">$0.00</div>
            <div className="text-sm text-green-600 mt-1">+0.00%</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Daily Change</span>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">$0.00</div>
            <div className="text-sm text-gray-600 mt-1">0.00%</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Portfolios</span>
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Positions</span>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>

        <div className="mb-12">
          <RealtimeDashboard />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Welcome to Stock Market Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first portfolio to track your investments in real-time.
          </p>
          <Link href="/portfolios/new">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Create First Portfolio
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
