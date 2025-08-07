'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

interface ApiOptions extends RequestInit {
  retryOnRateLimit?: boolean;
  maxRetries?: number;
}

export function useApiClient() {
  const apiCall = useCallback(async <T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    const { retryOnRateLimit = true, maxRetries = 3, ...fetchOptions } = options;
    let retries = 0;

    const makeRequest = async (): Promise<Response> => {
      const response = await fetch(url, fetchOptions);

      // Store rate limit headers
      const limit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');

      if (limit && remaining && reset) {
        localStorage.setItem('ratelimit-limit', limit);
        localStorage.setItem('ratelimit-remaining', remaining);
        localStorage.setItem('ratelimit-reset', reset);
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

        if (retryOnRateLimit && retries < maxRetries) {
          retries++;
          toast.warning(`Rate limited. Retrying in ${Math.ceil(waitTime / 1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return makeRequest();
        }

        const error = await response.json();
        throw new Error(error.error || 'Too many requests');
      }

      return response;
    };

    try {
      const response = await makeRequest();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }, []);

  const get = useCallback(<T = any>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall<T>(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback(<T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const put = useCallback(<T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const del = useCallback(<T = any>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall<T>(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  return {
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}