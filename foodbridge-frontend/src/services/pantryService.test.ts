import { describe, it, expect, vi, beforeEach } from 'vitest';
import pantryService from './pantryService';
import api from './api';
import type {
  PantryItem,
  TimeSlot,
  Appointment,
  BookAppointmentData,
  BookAppointmentResponse,
  AvailableSlotsResponse,
  SmartCartResponse,
} from '../types/pantry';

// Mock the API
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PantryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInventory', () => {
    it('should fetch all pantry inventory items', async () => {
      const mockInventory: PantryItem[] = [
        {
          item_id: '1',
          item_name: 'Rice',
          category: 'Grains',
          quantity: 50,
          in_stock: true,
          unit: 'lbs',
          dietary_tags: ['vegan', 'gluten-free'],
        },
        {
          item_id: '2',
          item_name: 'Beans',
          category: 'Legumes',
          quantity: 30,
          in_stock: true,
          unit: 'lbs',
          dietary_tags: ['vegan'],
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockInventory,
        message: 'Success',
      });

      const result = await pantryService.getInventory();

      expect(api.get).toHaveBeenCalledWith('/pantry/inventory', {});
      expect(result).toEqual(mockInventory);
    });

    it('should return empty array when no items in stock', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await pantryService.getInventory();

      expect(api.get).toHaveBeenCalledWith('/pantry/inventory', {});
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(pantryService.getInventory()).rejects.toThrow('Network error');
    });
  });

  describe('getAvailableSlots', () => {
    it('should fetch available appointment slots', async () => {
      const mockBackendSlots = [
        {
          time: '2024-01-15T09:00:00Z',
          available: true,
        },
        {
          time: '2024-01-15T09:30:00Z',
          available: true,
        },
        {
          time: '2024-01-15T10:00:00Z',
          available: false,
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockBackendSlots,
        message: 'Success',
      });

      const result = await pantryService.getAvailableSlots();

      expect(api.get).toHaveBeenCalledWith('/pantry/appointments/slots');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        slot_id: 'slot-0',
        slot_time: '2024-01-15T09:00:00Z',
        is_booked: false,
      });
      expect(result[2]).toEqual({
        slot_id: 'slot-2',
        slot_time: '2024-01-15T10:00:00Z',
        is_booked: true,
      });
    });

    it('should return empty array when no slots available', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await pantryService.getAvailableSlots();

      expect(api.get).toHaveBeenCalledWith('/pantry/appointments/slots');
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Server error'));

      await expect(pantryService.getAvailableSlots()).rejects.toThrow('Server error');
    });
  });

  describe('bookAppointment', () => {
    it('should book a pantry appointment', async () => {
      const bookData: BookAppointmentData = {
        slot_id: '1',
      };

      const mockAppointment: Appointment = {
        appointment_id: 'apt1',
        student_id: 'student1',
        slot_id: '1',
        status: 'scheduled',
        created_at: '2024-01-15T08:00:00Z',
        appointment_time: '2024-01-15T09:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          appointment: mockAppointment,
        },
        message: 'Appointment booked successfully',
      });

      const result = await pantryService.bookAppointment(bookData);

      expect(api.post).toHaveBeenCalledWith('/pantry/appointments', bookData);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw error when slot is already booked', async () => {
      const bookData: BookAppointmentData = {
        slot_id: '1',
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Slot already booked'));

      await expect(pantryService.bookAppointment(bookData)).rejects.toThrow(
        'Slot already booked'
      );
    });

    it('should throw error on API failure', async () => {
      const bookData: BookAppointmentData = {
        slot_id: '1',
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Server error'));

      await expect(pantryService.bookAppointment(bookData)).rejects.toThrow('Server error');
    });
  });

  describe('getStudentAppointments', () => {
    it('should fetch all appointments for a student', async () => {
      const mockAppointments: Appointment[] = [
        {
          appointment_id: 'apt1',
          student_id: 'student1',
          slot_id: '1',
          status: 'scheduled',
          created_at: '2024-01-15T08:00:00Z',
          appointment_time: '2024-01-15T09:00:00Z',
        },
        {
          appointment_id: 'apt2',
          student_id: 'student1',
          slot_id: '2',
          status: 'completed',
          created_at: '2024-01-14T08:00:00Z',
          appointment_time: '2024-01-14T10:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockAppointments,
        message: 'Success',
      });

      const result = await pantryService.getStudentAppointments('student1');

      expect(api.get).toHaveBeenCalledWith('/pantry/appointments/student/student1');
      expect(result).toEqual(mockAppointments);
    });

    it('should return empty array when student has no appointments', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await pantryService.getStudentAppointments('student-no-appointments');

      expect(api.get).toHaveBeenCalledWith('/pantry/appointments/student/student-no-appointments');
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Student not found'));

      await expect(pantryService.getStudentAppointments('nonexistent')).rejects.toThrow(
        'Student not found'
      );
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel a pantry appointment', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await pantryService.cancelAppointment('apt1');

      expect(api.delete).toHaveBeenCalledWith('/pantry/appointments/apt1');
    });

    it('should throw error when appointment not found', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Appointment not found'));

      await expect(pantryService.cancelAppointment('nonexistent')).rejects.toThrow(
        'Appointment not found'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Server error'));

      await expect(pantryService.cancelAppointment('apt1')).rejects.toThrow('Server error');
    });
  });

  describe('generateSmartCart', () => {
    it('should generate a smart cart based on user history', async () => {
      const mockItems: PantryItem[] = [
        {
          item_id: '1',
          item_name: 'Rice',
          category: 'Grains',
          quantity: 50,
          in_stock: true,
          unit: 'lbs',
          dietary_tags: ['vegan', 'gluten-free'],
        },
        {
          item_id: '2',
          item_name: 'Beans',
          category: 'Legumes',
          quantity: 30,
          in_stock: true,
          unit: 'lbs',
          dietary_tags: ['vegan'],
        },
        {
          item_id: '3',
          item_name: 'Pasta',
          category: 'Grains',
          quantity: 20,
          in_stock: true,
          unit: 'lbs',
          dietary_tags: [],
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          items: mockItems,
        },
        message: 'Success',
      });

      const result = await pantryService.generateSmartCart();

      expect(api.get).toHaveBeenCalledWith('/pantry/cart/generate');
      expect(result).toEqual(mockItems);
    });

    it('should return empty array when no recommendations available', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          items: [],
        },
        message: 'Success',
      });

      const result = await pantryService.generateSmartCart();

      expect(api.get).toHaveBeenCalledWith('/pantry/cart/generate');
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Server error'));

      await expect(pantryService.generateSmartCart()).rejects.toThrow('Server error');
    });
  });
});
