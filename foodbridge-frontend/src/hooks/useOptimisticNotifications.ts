import { useState, useCallback } from 'react';
import type { Notification } from '../types/notifications';
import {
  createOptimisticListUpdate,
  createOptimisticListRemoval,
} from '../utils/optimisticUpdates';

interface UseOptimisticNotificationsReturn {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markAsReadOptimistic: (
    notificationId: string,
    apiCall: () => Promise<void>
  ) => Promise<void>;
  deleteNotificationOptimistic: (
    notificationId: string,
    apiCall: () => Promise<void>
  ) => Promise<void>;
  unreadCount: number;
  updateUnreadCount: (count: number) => void;
}

/**
 * Hook for managing optimistic notification updates
 * Handles marking notifications as read and deleting with immediate UI feedback
 */
export const useOptimisticNotifications = (): UseOptimisticNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Mark notification as read with optimistic update
   * Immediately marks as read, rolls back if API fails
   */
  const markAsReadOptimistic = useCallback(
    async (notificationId: string, apiCall: () => Promise<void>): Promise<void> => {
      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;

      // Find the notification to check if it's unread
      const notification = notifications.find((n) => n.notification_id === notificationId);
      const wasUnread = notification?.is_read === false;

      // Optimistically mark as read
      setNotifications((prev) =>
        createOptimisticListUpdate(
          prev,
          notificationId,
          { is_read: true },
          'notification_id'
        )
      );

      // Decrement unread count if it was unread
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        // Execute API call
        await apiCall();
      } catch (error) {
        // Rollback to previous state
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        throw error;
      }
    },
    [notifications, unreadCount]
  );

  /**
   * Delete notification with optimistic update
   * Immediately removes notification, rolls back if API fails
   */
  const deleteNotificationOptimistic = useCallback(
    async (notificationId: string, apiCall: () => Promise<void>): Promise<void> => {
      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;

      // Find the notification to check if it's unread
      const notification = notifications.find((n) => n.notification_id === notificationId);
      const wasUnread = notification?.is_read === false;

      // Optimistically remove notification
      setNotifications((prev) =>
        createOptimisticListRemoval(prev, notificationId, 'notification_id')
      );

      // Decrement unread count if it was unread
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        // Execute API call
        await apiCall();
      } catch (error) {
        // Rollback to previous state
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        throw error;
      }
    },
    [notifications, unreadCount]
  );

  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  return {
    notifications,
    setNotifications,
    markAsReadOptimistic,
    deleteNotificationOptimistic,
    unreadCount,
    updateUnreadCount,
  };
};
