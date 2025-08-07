'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export function RateLimitStatus() {
  const [rateLimits, setRateLimits] = useState<RateLimitInfo | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check rate limit headers from last API response
    const checkRateLimit = () => {
      const limit = localStorage.getItem('ratelimit-limit');
      const remaining = localStorage.getItem('ratelimit-remaining');
      const reset = localStorage.getItem('ratelimit-reset');

      if (limit && remaining && reset) {
        const info: RateLimitInfo = {
          limit: parseInt(limit),
          remaining: parseInt(remaining),
          reset: new Date(reset),
        };
        setRateLimits(info);

        // Show warning if less than 20% remaining
        setShowWarning(info.remaining < info.limit * 0.2);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!rateLimits || (!showWarning && process.env.NODE_ENV === 'production')) {
    return null;
  }

  const percentRemaining = (rateLimits.remaining / rateLimits.limit) * 100;
  const timeUntilReset = Math.max(0, rateLimits.reset.getTime() - Date.now());
  const minutesUntilReset = Math.ceil(timeUntilReset / 60000);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div
        className={`p-3 rounded-lg border ${
          showWarning
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
            : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        }`}
      >
        <div className="flex items-center gap-2">
          {showWarning ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <div className="text-sm">
            <p className="font-medium">
              API Limit: {rateLimits.remaining}/{rateLimits.limit}
            </p>
            {showWarning && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Resets in {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              showWarning ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      </div>
    </div>
  );
}