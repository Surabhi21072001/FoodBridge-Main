import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticNotifications } from './useOptimisticNotifications';
import type { Notification } from '../types/notifications';

describe('useOptimisticNotifications', () => {
  const mockNotification: Notification = {
    notification_id: 'notif-1',
    user_id: 'user-1',
    type: 'reservation',
    message: 'Your reservation is confirmed',
    is_read: false,
    created_at: '2024-01-01T10:00:00Z',
  };

  const mockReadNotification: Notification = {
    ...mockNotification,
    is_read: true,
  };

  describe('markAsReadOptimistic', () => {
    it('should mark notification as read', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial notifications
      act(() => {
        result.current.setNotifications([mockNotification]);
        result.current.updateUnreadCount(1);
      });

      expect(result.current.notifications[0].is_read).toBe(false);
      expect(result.current.unreadCount).toBe(1);

      await act(async () => {
        await result.current.markAsReadOptimistic('notif-1', apiCall);
      });

      expect(result.current.notifications[0].is_read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should not decrement unread count if already read', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial notifications with already read notification
      act(() => {
        result.current.setNotifications([mockReadNotification]);
        result.current.updateUnreadCount(0);
      });

      await act(async () => {
        await result.current.markAsReadOptimistic('notif-1', apiCall);
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Set initial notifications
      act(() => {
        result.current.setNotifications([mockNotification]);
        result.current.updateUnreadCount(1);
      });

      await act(async () => {
        try {
          await result.current.markAsReadOptimistic('notif-1', apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.notifications[0].is_read).toBe(false);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('deleteNotificationOptimistic', () => {
    it('should delete unread notification and decrement count', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial notifications
      act(() => {
        result.current.setNotifications([mockNotification]);
        result.current.updateUnreadCount(1);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);

      await act(async () => {
        await result.current.deleteNotificationOptimistic('notif-1', apiCall);
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should delete read notification without changing count', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial notifications
      act(() => {
        result.current.setNotifications([mockReadNotification]);
        result.current.updateUnreadCount(0);
      });

      await act(async () => {
        await result.current.deleteNotificationOptimistic('notif-1', apiCall);
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Set initial notifications
      act(() => {
        result.current.setNotifications([mockNotification]);
        result.current.updateUnreadCount(1);
      });

      await act(async () => {
        try {
          await result.current.deleteNotificationOptimistic('notif-1', apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].notification_id).toBe('notif-1');
      expect(result.current.unreadCount).toBe(1);
    });

    it('should prevent unread count from going negative', async () => {
      const { result } = renderHook(() => useOptimisticNotifications());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Set initial notifications with unread count at 0
      act(() => {
        result.current.setNotifications([mockNotification]);
        result.current.updateUnreadCount(0);
      });

      await act(async () => {
        await result.current.deleteNotificationOptimistic('notif-1', apiCall);
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('updateUnreadCount', () => {
    it('should update unread count', () => {
      const { result } = renderHook(() => useOptimisticNotifications());

      act(() => {
        result.current.updateUnreadCount(5);
      });

      expect(result.current.unreadCount).toBe(5);
    });
  });

  describe('setNotifications', () => {
    it('should update notifications state', () => {
      const { result } = renderHook(() => useOptimisticNotifications());

      act(() => {
        result.current.setNotifications([mockNotification]);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].notification_id).toBe('notif-1');
    });
  });
});
