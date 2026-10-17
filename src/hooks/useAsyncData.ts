import { useEffect, useRef } from "react";
import { useState } from "react";
import { useAuth } from "./useAuth";

export interface AsyncDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export type FetchFn<T> = () => Promise<T>;

/**
 * Generic async-data hool owning the loading, error, unauthenticated
 * and cleanup lifecycle for user-scoped data.
 */
export const useAsyncData = <T>(
  fetchFn: FetchFn<T>,
  errorMessage = "Failed to fetch data",
): AsyncDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();

  // Keep the latest fetch function without restarting the effect on every render.
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const errorMessageRef = useRef(errorMessage);
  errorMessageRef.current = errorMessage;

  useEffect(() => {
    let isActive = true;

    if (!user) {
      const timer = setTimeout(() => {
        if (isActive) {
          setIsLoading(false);
        }
      }, 0);
      return () => {
        isActive = false;
        clearTimeout(timer);
      };
    }

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchRef.current();
        if (isActive) {
          setData(result);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err : new Error(errorMessageRef.current),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [user]);

  return { data, isLoading, error };
};
