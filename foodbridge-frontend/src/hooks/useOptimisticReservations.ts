import { useState, useCallback } from 'react';
import type { Reservation } from '../types/reservations';
import type { Listing } from '../types/listings';
import {
  createOptimisticListRemoval,
} from '../utils/optimisticUpdates';

interface UseOptimisticReservationsReturn {
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;
  createReservationOptimistic: (
    listing: Listing,
    quantity: number,
    apiCall: () => Promise<Reservation>
  ) => Promise<Reservation>;
  cancelReservationOptimistic: (
    reservationId: string,
    apiCall: () => Promise<void>
  ) => Promise<void>;
}

/**
 * Hook for managing optimistic reservation updates
 * Handles creating and canceling reservations with immediate UI feedback
 */
export const useOptimisticReservations = (): UseOptimisticReservationsReturn => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  /**
   * Create a reservation with optimistic update
   * Immediately updates available quantity, rolls back if API fails
   */
  const createReservationOptimistic = useCallback(
    async (
      listing: Listing,
      quantity: number,
      apiCall: () => Promise<Reservation>
    ): Promise<Reservation> => {
      // Create optimistic reservation object
      const optimisticReservation: Reservation = {
        reservation_id: `temp-${Date.now()}`,
        listing_id: listing.listing_id,
        student_id: '', // Will be populated by API
        quantity,
        status: 'active',
        created_at: new Date().toISOString(),
        listing: {
          ...listing,
          available_quantity: listing.available_quantity - quantity,
        },
      };

      // Add optimistic reservation to list
      const previousReservations = reservations;
      setReservations((prev) => [optimisticReservation, ...prev]);

      try {
        // Execute API call
        const result = await apiCall();

        // Replace temporary reservation with actual one
        setReservations((prev) =>
          prev.map((r) =>
            r.reservation_id === optimisticReservation.reservation_id ? result : r
          )
        );

        return result;
      } catch (error) {
        // Rollback to previous state
        setReservations(previousReservations);
        throw error;
      }
    },
    [reservations]
  );

  /**
   * Cancel a reservation with optimistic update
   * Immediately removes reservation, rolls back if API fails
   */
  const cancelReservationOptimistic = useCallback(
    async (reservationId: string, apiCall: () => Promise<void>): Promise<void> => {
      const previousReservations = reservations;

      // Optimistically remove reservation
      setReservations((prev) =>
        createOptimisticListRemoval(prev, reservationId, 'reservation_id')
      );

      try {
        // Execute API call
        await apiCall();
      } catch (error) {
        // Rollback to previous state
        setReservations(previousReservations);
        throw error;
      }
    },
    [reservations]
  );

  return {
    reservations,
    setReservations,
    createReservationOptimistic,
    cancelReservationOptimistic,
  };
};
