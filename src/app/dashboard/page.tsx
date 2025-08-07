import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TrendingUp, DollarSign, Activity, PieChart, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold">Stock Market Dashboard</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session.user.email}
              </span>
              <form action={async () => {
                'use server';
                const { signOut } = await import('@/auth');
                await signOut();
              }}>
                <button className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {session.user.name}!</h2>
          <p className="text-gray-600 dark:text-gray-400">Here's your portfolio overview</p>
        </div>

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

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Portfolios</h3>
            <Link 
              href="/portfolios/new"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Portfolio
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any portfolios yet. Create your first portfolio to start tracking your investments.
          </p>
        </div>
      </main>
    </div>
  );
}