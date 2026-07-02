import { useCallback, useEffect, useMemo, useState } from 'react';
import { LearningPathsContext } from './LearningPathsContext';
import type {
  LearningPathSummary,
  PathsApiResponse,
  ProviderProps,
} from './types';

export const LearningPathsProvider = ({ children }: ProviderProps) => {
  const [data, setData] = useState<LearningPathSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPaths = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch('/api/paths', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const json: PathsApiResponse = await res.json();

      if (!json.success) {
        throw new Error('API responded with success = false');
      }

      setData(json.data);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      setIsError(true);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      isError,
      refetch: fetchPaths,
    }),
    [data, isLoading, isError, fetchPaths],
  );

  return (
    <LearningPathsContext.Provider value={value}>
      {children}
    </LearningPathsContext.Provider>
  );
};
