'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An error occurred',
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      let errorMessage = fallbackMessage;
      let errorObject: Error;

      if (error instanceof AppError) {
        errorMessage = error.message;
        errorObject = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorObject = error;
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorObject = new Error(error);
      } else {
        errorObject = new Error(fallbackMessage);
      }

      setError(errorObject);
      setIsError(true);

      if (logError) {
        logger.error({
          error: errorObject,
          context: 'useErrorHandler',
        });
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return errorObject;
    },
    [showToast, logError, fallbackMessage]
  );

  const resetError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  const throwError = useCallback((error: unknown) => {
    const errorObject = handleError(error);
    throw errorObject;
  }, [handleError]);

  return {
    error,
    isError,
    handleError,
    resetError,
    throwError,
  };
}

// Async function wrapper with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler();

  return useCallback(
    async <T,>(asyncFunction: () => Promise<T>): Promise<T | null> => {
      try {
        return await asyncFunction();
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [handleError]
  );
}