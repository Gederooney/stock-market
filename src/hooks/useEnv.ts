'use client';

import { useEffect, useState } from 'react';

interface PublicEnv {
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_ENVIRONMENT?: string;
}

export function useEnv() {
  const [publicEnv, setPublicEnv] = useState<PublicEnv>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ces variables sont injectées par Next.js au build time
    setPublicEnv({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    });
    setIsLoading(false);
  }, []);

  return {
    env: publicEnv,
    isLoading,
    isDevelopment: publicEnv.NEXT_PUBLIC_ENVIRONMENT === 'development',
    isProduction: publicEnv.NEXT_PUBLIC_ENVIRONMENT === 'production',
  };
}