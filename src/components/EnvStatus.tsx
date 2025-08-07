'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface EnvStatusData {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  environment: string;
}

export function EnvStatus() {
  const [status, setStatus] = useState<EnvStatusData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/env/status')
        .then(res => res.json())
        .then(setStatus)
        .catch(console.error);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !status) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full transition-colors ${
          status.isValid
            ? 'bg-green-500 hover:bg-green-600'
            : status.errors.length > 0
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-yellow-500 hover:bg-yellow-600'
        } text-white`}
      >
        {status.isValid ? (
          <CheckCircle className="h-5 w-5" />
        ) : status.errors.length > 0 ? (
          <XCircle className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-2">Environment Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Environment: <span className="font-mono">{status.environment}</span>
          </p>

          {status.errors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-red-600 mb-1">Errors:</h4>
              <ul className="text-xs space-y-1">
                {status.errors.map((error, i) => (
                  <li key={i} className="text-red-600">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-600 mb-1">Warnings:</h4>
              <ul className="text-xs space-y-1">
                {status.warnings.map((warning, i) => (
                  <li key={i} className="text-yellow-600">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status.isValid && (
            <p className="text-sm text-green-600">✓ All environment variables are valid</p>
          )}
        </div>
      )}
    </div>
  );
}