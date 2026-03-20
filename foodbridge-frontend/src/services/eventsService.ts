import api from './api';
import type { Listing } from '../types/listings';
import type { VolunteerOpportunity, VolunteerParticipation } from '../types/events';

/**
 * Events Service
 * Handles all event-related operations including event food listings and volunteer opportunities
 */
class EventsService {
  /**
   * Get all event food listings
   * @param params - Query parameters (available_now, dietary_filters, page, limit)
   * @returns Array of event food listings
   */
  async getEventFood(params?: {
    available_now?: boolean;
    dietary_filters?: string[];
    page?: number;
    limit?: number;
  }): Promise<Listing[]> {
    try {
      const queryParams: Record<string, any> = {};
      if (params) {
        if (params.available_now !== undefined) queryParams.available_now = params.available_now;
        if (params.dietary_filters) queryParams.dietary_filters = params.dietary_filters;
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
      }
      const response = await api.get<any>('/event-food', queryParams);
      return response?.data?.listings || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get event food available today
   * @returns Array of event food available today
   */
  async getEventFoodToday(): Promise<Listing[]> {
    try {
      const response = await api.get<any>('/event-food/today');
      return response?.data?.listings || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upcoming event food
   * @param days - Number of days to look ahead (default: 7)
   * @returns Array of upcoming event food
   */
  async getUpcomingEventFood(days: number = 7): Promise<Listing[]> {
    try {
      const response = await api.get<any>('/event-food/upcoming', { days });
      return response?.data?.listings || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get event food details by ID
   * @param id - Event food ID
   * @returns Event food details
   */
  async getEventFoodById(id: string): Promise<Listing> {
    try {
      const response = await api.get<any>(`/event-food/${id}`);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get event food from a specific provider
   * @param providerId - Provider ID
   * @returns Array of event food from provider
   */
  async getEventFoodByProvider(providerId: string): Promise<Listing[]> {
    try {
      const response = await api.get<any>(`/event-food/provider/${providerId}`);
      return response?.data?.listings || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all volunteer opportunities
   * @returns Array of volunteer opportunities
   */
  async getVolunteerOpportunities(): Promise<VolunteerOpportunity[]> {
    try {
      const response = await api.get<any>('/volunteer/opportunities');
      // Handle both paginated and direct array responses
      if (response?.data?.opportunities) {
        return response.data.opportunities;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign up for a volunteer opportunity
   * @param opportunityId - Volunteer opportunity ID
   */
  async signUpForVolunteer(opportunityId: string): Promise<void> {
    try {
      await api.post<void>(`/volunteer/signup`, { opportunity_id: opportunityId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get volunteer participation history for a student
   * @param studentId - Student ID
   * @returns Array of volunteer participations
   */
  async getStudentVolunteerHistory(studentId: string): Promise<VolunteerParticipation[]> {
    try {
      const response = await api.get<any>(
        `/volunteer/participation/${studentId}`
      );
      if (response?.data?.participations) return response.data.participations;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel volunteer signup
   * @param participationId - Volunteer participation ID
   */
  async cancelVolunteerSignup(participationId: string): Promise<void> {
    try {
      await api.delete<void>(`/volunteer/signup/${participationId}`);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const eventsService = new EventsService();
export default eventsService;
