'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StockPriceChartProps {
  symbol: string;
}

type TimeRange = 'intraday' | 'daily' | 'weekly' | 'monthly';

export function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  const { data, isLoading, error } = useQuery({
    queryKey: ['stock-history', symbol, timeRange],
    queryFn: async () => {
      const endpoint = timeRange === 'intraday' 
        ? `/api/stocks/${symbol}/intraday?interval=5min`
        : `/api/stocks/${symbol}/history?interval=${timeRange}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    enabled: !!symbol,
    staleTime: 60000, // 1 minute
  });

  const chartData = data?.intraday || data?.history || [];

  const formatXAxis = (value: string) => {
    if (timeRange === 'intraday') {
      const date = new Date(value);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-green-600">
            Open: {formatCurrency(payload[0].payload.open)}
          </p>
          <p className="text-sm text-blue-600">
            Close: {formatCurrency(payload[0].payload.close)}
          </p>
          <p className="text-sm text-purple-600">
            High: {formatCurrency(payload[0].payload.high)}
          </p>
          <p className="text-sm text-red-600">
            Low: {formatCurrency(payload[0].payload.low)}
          </p>
          <p className="text-sm text-gray-600">
            Volume: {payload[0].payload.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Price Chart - {symbol}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeRange === 'intraday' ? 'default' : 'outline'}
              onClick={() => setTimeRange('intraday')}
            >
              1D
            </Button>
            <Button
              size="sm"
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              onClick={() => setTimeRange('daily')}
            >
              1M
            </Button>
            <Button
              size="sm"
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              onClick={() => setTimeRange('weekly')}
            >
              3M
            </Button>
            <Button
              size="sm"
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              onClick={() => setTimeRange('monthly')}
            >
              1Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96 text-red-500">
            Failed to load chart data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={timeRange === 'intraday' ? 'datetime' : 'date'}
                tickFormatter={formatXAxis}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorClose)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}