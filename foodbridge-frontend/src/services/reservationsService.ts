import api from './api';
import type {
  Reservation,
  CreateReservationData,
} from '../types/reservations';

/**
 * Reservations Service
 * Handles all food reservation operations including creating, retrieving, and canceling reservations
 */
class ReservationsService {
  /**
   * Create a new reservation for a food listing
   * @param data - Reservation creation data (listing_id and quantity)
   * @returns Created reservation with confirmation details
   */
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    try {
      const response = await api.post<any>('/reservations', data);
      return response?.data?.reservation || response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reservations for a specific student
   * @param studentId - Student ID
   * @returns Array of reservations for the student
   */
  async getStudentReservations(studentId: string): Promise<Reservation[]> {
    try {
      const response = await api.get<any>(`/reservations/student/${studentId}`);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reservations for a specific listing
   * @param listingId - Listing ID
   * @returns Array of reservations for the listing
   */
  async getListingReservations(listingId: string): Promise<Reservation[]> {
    try {
      const response = await api.get<any>(`/reservations/listing/${listingId}`);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel an existing reservation
   * @param reservationId - Reservation ID to cancel
   */
  async cancelReservation(reservationId: string): Promise<void> {
    try {
      await api.delete<void>(`/reservations/${reservationId}`);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const reservationsService = new ReservationsService();
export default reservationsService;
