import api from './api';
import type {
  PantryItem,
  TimeSlot,
  Appointment,
  CartItem,
  Order,
  BookAppointmentData,
} from '../types/pantry';

/**
 * Pantry Service
 * Handles all pantry-related operations including inventory browsing, appointment booking,
 * cart management, and smart cart generation
 */
class PantryService {
  /**
   * Get all available pantry inventory items
   * @param params - Query parameters (page, limit, category, search)
   * @returns Array of pantry items currently in stock
   */
  async getInventory(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PantryItem[]> {
    try {
      const queryParams: Record<string, any> = {};
      if (params) {
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
        if (params.category) queryParams.category = params.category;
        if (params.search) queryParams.search = params.search;
      }
      const response = await api.get<any>('/pantry/inventory', queryParams);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific inventory item details
   * @param id - Inventory item ID
   * @returns Inventory item details
   */
  async getInventoryItem(id: string): Promise<PantryItem> {
    try {
      const response = await api.get<any>(`/pantry/inventory/${id}`);
      return response?.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get low stock items (admin only)
   * @returns Array of low stock items
   */
  async getLowStockItems(): Promise<PantryItem[]> {
    try {
      const response = await api.get<any>('/pantry/inventory/admin/low-stock');
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available appointment slots for pantry visits
   * @returns Array of available time slots
   */
  async getAvailableSlots(): Promise<TimeSlot[]> {
    try {
      const toDateParam = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const [todayRes, tomorrowRes] = await Promise.all([
        api.get<any>(`/pantry/appointments/slots?date=${toDateParam(today)}`),
        api.get<any>(`/pantry/appointments/slots?date=${toDateParam(tomorrow)}`),
      ]);

      const allSlots = [
        ...(todayRes?.data || []),
        ...(tomorrowRes?.data || []),
      ];

      return allSlots.map((slot: any, index: number) => ({
        slot_id: `slot-${index}`,
        slot_time: slot.time,
        is_booked: !slot.available,
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's appointments
   * @param params - Query parameters (page, limit)
   * @returns Array of user's appointments
   */
  async getAppointments(params?: { page?: number; limit?: number }): Promise<Appointment[]> {
    try {
      const queryParams: Record<string, any> = {};
      if (params) {
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
      }
      const response = await api.get<any>('/pantry/appointments', queryParams);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific appointment details
   * @param id - Appointment ID
   * @returns Appointment details
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await api.get<any>(`/pantry/appointments/${id}`);
      return response?.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appointments by student ID
   * @param studentId - Student ID
   * @returns Array of appointments for the student
   */
  async getStudentAppointments(studentId: string): Promise<Appointment[]> {
    try {
      const response = await api.get<any>(`/pantry/appointments/student/${studentId}`);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Book a pantry appointment for a specific time slot
   * @param data - Appointment booking data (slot_id)
   * @returns Created appointment with confirmation details
   */
  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post<any>('/pantry/appointments', data);
      return response?.data?.appointment || response?.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel an existing pantry appointment
   * @param appointmentId - Appointment ID to cancel
   */
  async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      await api.delete<void>(`/pantry/appointments/${appointmentId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's shopping cart
   * @returns User's shopping cart
   */
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get<any>('/pantry/orders/cart');
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's order history
   * @param params - Query parameters (page, limit)
   * @returns Array of user's orders
   */
  async getOrderHistory(params?: { page?: number; limit?: number }): Promise<Order[]> {
    try {
      const queryParams: Record<string, any> = {};
      if (params) {
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
      }
      const response = await api.get<any>('/pantry/orders', queryParams);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific order details
   * @param id - Order ID
   * @returns Order details
   */
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get<any>(`/pantry/orders/${id}`);
      return response?.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate a smart pantry cart based on user's order history and preferences
   * @returns Array of recommended pantry items
   */
  async generateSmartCart(): Promise<PantryItem[]> {
    try {
      const response = await api.get<any>('/pantry/cart/generate');
      return response?.data?.items || [];
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const pantryService = new PantryService();
export default pantryService;
