import { useEffect, useRef, useCallback } from 'react';
import listingsService from '../services/listingsService';
import type { Listing, ListingQueryParams } from '../types/listings';

interface UseListingsPollingOptions {
  enabled?: boolean;
  pollInterval?: number;
  onListingsUpdate?: (listings: Listing[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for polling listings with real-time updates
 * Polls the backend every 30 seconds to fetch updated listings
 * Updates quantities when reservations change
 */
export const useListingsPolling = (
  queryParams: ListingQueryParams | undefined,
  options: UseListingsPollingOptions = {}
) => {
  const {
    enabled = true,
    pollInterval = 30000, // 30 seconds
    onListingsUpdate,
    onError,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const pollListings = useCallback(async () => {
    try {
      if (!queryParams) return;

      const response = await listingsService.getListings(queryParams);
      const updatedListings = response?.data || [];

      if (onListingsUpdate) {
        onListingsUpdate(updatedListings);
      }

      lastFetchRef.current = Date.now();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to poll listings');
      if (onError) {
        onError(err);
      }
      console.error('Error polling listings:', error);
    }
  }, [queryParams, onListingsUpdate, onError]);

  useEffect(() => {
    if (!enabled || !queryParams) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up polling interval
    intervalRef.current = setInterval(pollListings, pollInterval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, queryParams, pollInterval, pollListings]);

  return {
    pollListings,
    stopPolling: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
  };
};

export default useListingsPolling;
