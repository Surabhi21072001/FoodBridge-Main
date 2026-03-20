import { useEffect, useRef, useCallback } from 'react';
import notificationsService from '../services/notificationsService';
import type { Notification } from '../types/notifications';

/**
 * Hook for polling notifications in real-time
 * Fetches new notifications every 30 seconds and updates the provided state
 * 
 * Validates: Requirements 8.4, 8.5
 */
export const useNotificationsPolling = (
  userId: string | undefined,
  onNotificationsUpdate: (notifications: Notification[]) => void,
  enabled: boolean = true
) => {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await notificationsService.getNotifications(userId);
      // Sort by timestamp descending (most recent first)
      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      onNotificationsUpdate(sorted);
      lastFetchRef.current = Date.now();
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, [userId, onNotificationsUpdate]);

  useEffect(() => {
    if (!enabled || !userId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Set up polling to check for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [userId, enabled, fetchNotifications]);

  return { fetchNotifications };
};
