import api from './api';

/**
 * Calendar Service
 * Handles Google Calendar integration status and disconnect operations
 */
class CalendarService {
  /**
   * Get the current Google Calendar connection status for the authenticated user
   * @returns Object indicating whether the user has a connected Google Calendar
   */
  async getStatus(): Promise<{ connected: boolean }> {
    const response = await api.get<{ connected: boolean }>('/auth/google/calendar/status');
    return response ?? { connected: false };
  }

  /**
   * Disconnect the user's Google Calendar integration
   * Deletes the stored OAuth tokens for the current user
   */
  async disconnect(): Promise<void> {
    await api.delete<void>('/auth/google/calendar');
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
export default calendarService;
