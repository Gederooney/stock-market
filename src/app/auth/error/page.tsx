'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = (() => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-8">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4">Authentication Error</h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            {errorMessage}
          </p>
          
          <div className="flex gap-4">
            <Link
              href="/auth/signin"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}