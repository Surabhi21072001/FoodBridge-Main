import { describe, it, expect, vi, beforeEach } from 'vitest';
import reservationsService from './reservationsService';
import api from './api';
import type { Reservation } from '../types/reservations';

// Mock the API
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ReservationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should create a new reservation with valid data', async () => {
      const createData = {
        listing_id: 'listing1',
        quantity: 2,
      };

      const mockReservation: Reservation = {
        reservation_id: 'res1',
        listing_id: 'listing1',
        student_id: 'student1',
        quantity: 2,
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          reservation: mockReservation,
        },
        message: 'Reservation created successfully',
      });

      const result = await reservationsService.createReservation(createData);

      expect(api.post).toHaveBeenCalledWith('/reservations', createData);
      expect(result).toEqual(mockReservation);
    });

    it('should throw error when quantity exceeds available quantity', async () => {
      const createData = {
        listing_id: 'listing1',
        quantity: 100,
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Insufficient quantity available'));

      await expect(reservationsService.createReservation(createData)).rejects.toThrow(
        'Insufficient quantity available'
      );
    });

    it('should throw error when listing does not exist', async () => {
      const createData = {
        listing_id: 'nonexistent',
        quantity: 2,
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Listing not found'));

      await expect(reservationsService.createReservation(createData)).rejects.toThrow(
        'Listing not found'
      );
    });

    it('should throw error on API failure', async () => {
      const createData = {
        listing_id: 'listing1',
        quantity: 2,
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      await expect(reservationsService.createReservation(createData)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getStudentReservations', () => {
    it('should fetch all reservations for a student', async () => {
      const mockReservations: Reservation[] = [
        {
          reservation_id: 'res1',
          listing_id: 'listing1',
          student_id: 'student1',
          quantity: 2,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          reservation_id: 'res2',
          listing_id: 'listing2',
          student_id: 'student1',
          quantity: 1,
          status: 'active',
          created_at: '2024-01-16T10:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockReservations,
        message: 'Success',
      });

      const result = await reservationsService.getStudentReservations('student1');

      expect(api.get).toHaveBeenCalledWith('/reservations/student/student1');
      expect(result).toEqual(mockReservations);
    });

    it('should return empty array if student has no reservations', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await reservationsService.getStudentReservations('student-no-reservations');

      expect(api.get).toHaveBeenCalledWith('/reservations/student/student-no-reservations');
      expect(result).toEqual([]);
    });

    it('should throw error when student does not exist', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Student not found'));

      await expect(reservationsService.getStudentReservations('nonexistent')).rejects.toThrow(
        'Student not found'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(reservationsService.getStudentReservations('student1')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getListingReservations', () => {
    it('should fetch all reservations for a listing', async () => {
      const mockReservations: Reservation[] = [
        {
          reservation_id: 'res1',
          listing_id: 'listing1',
          student_id: 'student1',
          quantity: 2,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          reservation_id: 'res2',
          listing_id: 'listing1',
          student_id: 'student2',
          quantity: 1,
          status: 'active',
          created_at: '2024-01-15T11:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockReservations,
        message: 'Success',
      });

      const result = await reservationsService.getListingReservations('listing1');

      expect(api.get).toHaveBeenCalledWith('/reservations/listing/listing1');
      expect(result).toEqual(mockReservations);
    });

    it('should return empty array if listing has no reservations', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await reservationsService.getListingReservations('listing-no-reservations');

      expect(api.get).toHaveBeenCalledWith('/reservations/listing/listing-no-reservations');
      expect(result).toEqual([]);
    });

    it('should throw error when listing does not exist', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Listing not found'));

      await expect(reservationsService.getListingReservations('nonexistent')).rejects.toThrow(
        'Listing not found'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(reservationsService.getListingReservations('listing1')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel an existing reservation', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await reservationsService.cancelReservation('res1');

      expect(api.delete).toHaveBeenCalledWith('/reservations/res1');
    });

    it('should throw error when reservation does not exist', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Reservation not found'));

      await expect(reservationsService.cancelReservation('nonexistent')).rejects.toThrow(
        'Reservation not found'
      );
    });

    it('should throw error when reservation is already cancelled', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Reservation is already cancelled'));

      await expect(reservationsService.cancelReservation('res1')).rejects.toThrow(
        'Reservation is already cancelled'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Network error'));

      await expect(reservationsService.cancelReservation('res1')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
