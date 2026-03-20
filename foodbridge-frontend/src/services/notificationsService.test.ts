import { describe, it, expect, vi, beforeEach } from 'vitest';
import notificationsService from './notificationsService';
import api from './api';
import type { Notification } from '../types/notifications';

// Mock the API
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications for a user', async () => {
      const mockNotifications: Notification[] = [
        {
          notification_id: '1',
          user_id: 'user-1',
          type: 'reservation_confirmed',
          message: 'Your reservation has been confirmed',
          is_read: false,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          notification_id: '2',
          user_id: 'user-1',
          type: 'new_listing',
          message: 'New food listing available',
          is_read: true,
          created_at: '2024-01-14T15:30:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockNotifications,
        message: 'Success',
      });

      const result = await notificationsService.getNotifications('user-1');

      expect(api.get).toHaveBeenCalledWith('/notifications/user/user-1');
      expect(result).toEqual(mockNotifications);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'));

      await expect(notificationsService.getNotifications('user-1')).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      vi.mocked(api.patch).mockResolvedValue(undefined);

      await notificationsService.markAsRead('notification-1');

      expect(api.patch).toHaveBeenCalledWith('/notifications/notification-1/read', {});
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.patch).mockRejectedValue(new Error('API Error'));

      await expect(notificationsService.markAsRead('notification-1')).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await notificationsService.deleteNotification('notification-1');

      expect(api.delete).toHaveBeenCalledWith('/notifications/notification-1');
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('API Error'));

      await expect(notificationsService.deleteNotification('notification-1')).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread notification count for a user', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          unread_count: 5,
        },
        message: 'Success',
      });

      const result = await notificationsService.getUnreadCount('user-1');

      expect(api.get).toHaveBeenCalledWith('/notifications/user/user-1/unread-count');
      expect(result).toBe(5);
    });

    it('should return 0 when no unread notifications', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          unread_count: 0,
        },
        message: 'Success',
      });

      const result = await notificationsService.getUnreadCount('user-1');

      expect(result).toBe(0);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'));

      await expect(notificationsService.getUnreadCount('user-1')).rejects.toThrow(
        'API Error'
      );
    });
  });
});
