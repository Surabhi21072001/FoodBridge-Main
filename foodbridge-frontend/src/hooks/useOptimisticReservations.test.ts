import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticReservations } from './useOptimisticReservations';
import type { Listing } from '../types/listings';
import type { Reservation } from '../types/reservations';

describe('useOptimisticReservations', () => {
  const mockListing: Listing = {
    listing_id: 'listing-1',
    provider_id: 'provider-1',
    food_name: 'Pizza',
    description: 'Leftover pizza',
    quantity: 10,
    available_quantity: 10,
    location: 'Dining Hall A',
    pickup_window_start: '2024-01-01T12:00:00Z',
    pickup_window_end: '2024-01-01T14:00:00Z',
    food_type: 'Italian',
    dietary_tags: ['vegetarian'],
    listing_type: 'donation',
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  };

  const mockReservation: Reservation = {
    reservation_id: 'res-1',
    listing_id: 'listing-1',
    student_id: 'student-1',
    quantity: 2,
    status: 'active',
    created_at: '2024-01-01T11:00:00Z',
  };

  describe('createReservationOptimistic', () => {
    it('should add optimistic reservation and call API', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const apiCall = vi.fn().mockResolvedValue(mockReservation);

      await act(async () => {
        await result.current.createReservationOptimistic(mockListing, 2, apiCall);
      });

      expect(result.current.reservations).toHaveLength(1);
      expect(result.current.reservations[0].quantity).toBe(2);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should replace temporary reservation with actual one on success', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const apiCall = vi.fn().mockResolvedValue(mockReservation);

      await act(async () => {
        await result.current.createReservationOptimistic(mockListing, 2, apiCall);
      });

      expect(result.current.reservations[0].reservation_id).toBe('res-1');
      expect(result.current.reservations[0].student_id).toBe('student-1');
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.createReservationOptimistic(mockListing, 2, apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.reservations).toHaveLength(0);
    });

    it('should create optimistic reservation with updated quantity', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const apiCall = vi.fn().mockResolvedValue(mockReservation);

      await act(async () => {
        await result.current.createReservationOptimistic(mockListing, 2, apiCall);
      });

      // After API call, reservation is replaced with actual one
      // But the optimistic update should have happened first
      expect(result.current.reservations).toHaveLength(1);
      expect(result.current.reservations[0].quantity).toBe(2);
    });
  });

  describe('cancelReservationOptimistic', () => {
    it('should remove reservation optimistically', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial reservations
      act(() => {
        result.current.setReservations([mockReservation]);
      });

      expect(result.current.reservations).toHaveLength(1);

      await act(async () => {
        await result.current.cancelReservationOptimistic('res-1', apiCall);
      });

      expect(result.current.reservations).toHaveLength(0);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticReservations());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Set initial reservations
      act(() => {
        result.current.setReservations([mockReservation]);
      });

      await act(async () => {
        try {
          await result.current.cancelReservationOptimistic('res-1', apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.reservations).toHaveLength(1);
      expect(result.current.reservations[0].reservation_id).toBe('res-1');
    });
  });

  describe('setReservations', () => {
    it('should update reservations state', () => {
      const { result } = renderHook(() => useOptimisticReservations());

      act(() => {
        result.current.setReservations([mockReservation]);
      });

      expect(result.current.reservations).toHaveLength(1);
      expect(result.current.reservations[0].reservation_id).toBe('res-1');
    });
  });
});
