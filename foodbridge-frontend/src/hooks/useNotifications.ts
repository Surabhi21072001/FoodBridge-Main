import { useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing notifications
 * Provides methods to fetch unread notification count
 */
export const useNotifications = () => {
  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.unread_count || 0;
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
      return 0;
    }
  }, []);

  return {
    getUnreadCount,
  };
};
