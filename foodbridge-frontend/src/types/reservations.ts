import type { Listing } from './listings';

/**
 * Reservation type representing a food listing reservation by a student
 */
export interface Reservation {
  id: string;
  listing_id: string;
  user_id: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'cancelled' | 'no_show';
  confirmation_code?: string;
  pickup_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  picked_up_at?: string;
  listing?: Listing; // Populated in some responses
}

/**
 * Data required to create a new reservation
 */
export interface CreateReservationData {
  listing_id: string;
  quantity: number;
}

/**
 * Response from creating a reservation
 */
export interface CreateReservationResponse {
  reservation: Reservation;
  message: string;
}
