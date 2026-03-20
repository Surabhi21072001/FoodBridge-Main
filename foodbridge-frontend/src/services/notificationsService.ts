import api from './api';
import type { Notification } from '../types/notifications';

/**
 * Notifications Service
 * Handles notification operations including fetching, marking as read, and deleting notifications
 */
class NotificationsService {
  /**
   * Get all notifications for a user
   * Fetches notifications from the backend API ordered by timestamp descending
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await api.get<any>(`/notifications/user/${userId}`);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * Sends a request to the backend API to mark the notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a notification
   * Sends a delete request to the backend API to remove the notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * Fetches the count of unread notifications from the backend API
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await api.get<any>(
        `/notifications/user/${userId}/unread-count`
      );
      return response?.data?.unread_count || 0;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();
export default notificationsService;
