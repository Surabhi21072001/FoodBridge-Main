import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useListingsPolling } from './useListingsPolling';
import type { ListingQueryParams } from '../types/listings';

describe('useListingsPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should not poll when disabled', () => {
    const onListingsUpdate = vi.fn();
    const queryParams: ListingQueryParams = { page: 1, limit: 20 };

    renderHook(() =>
      useListingsPolling(queryParams, {
        enabled: false,
        pollInterval: 30000,
        onListingsUpdate,
      })
    );

    vi.advanceTimersByTime(30000);

    expect(onListingsUpdate).not.toHaveBeenCalled();
  });

  it('should not poll when queryParams is undefined', () => {
    const onListingsUpdate = vi.fn();

    renderHook(() =>
      useListingsPolling(undefined, {
        enabled: true,
        pollInterval: 30000,
        onListingsUpdate,
      })
    );

    vi.advanceTimersByTime(30000);

    expect(onListingsUpdate).not.toHaveBeenCalled();
  });

  it('should clear interval on unmount', () => {
    const queryParams: ListingQueryParams = { page: 1, limit: 20 };
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() =>
      useListingsPolling(queryParams, {
        enabled: true,
        pollInterval: 30000,
      })
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should return stopPolling function', () => {
    const queryParams: ListingQueryParams = { page: 1, limit: 20 };

    const { result } = renderHook(() =>
      useListingsPolling(queryParams, {
        enabled: true,
        pollInterval: 30000,
      })
    );

    expect(result.current).toHaveProperty('stopPolling');
    expect(typeof result.current.stopPolling).toBe('function');
  });

  it('should return pollListings function', () => {
    const queryParams: ListingQueryParams = { page: 1, limit: 20 };

    const { result } = renderHook(() =>
      useListingsPolling(queryParams, {
        enabled: true,
        pollInterval: 30000,
      })
    );

    expect(result.current).toHaveProperty('pollListings');
    expect(typeof result.current.pollListings).toBe('function');
  });
});
