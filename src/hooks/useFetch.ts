'use client';

import { useState, useEffect, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  skip?: boolean;
}

interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (newOptions?: FetchOptions) => Promise<void>;
}


export function useFetch<T = any>(
  url: string,
  options?: FetchOptions
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (currentOptions?: FetchOptions) => {
      if (currentOptions?.skip) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...options,
          ...currentOptions,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            ...currentOptions?.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency on fetchData ensures it only runs when its dependencies change

  const refetch = useCallback(async (newOptions?: FetchOptions) => {
    await fetchData(newOptions);
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}
