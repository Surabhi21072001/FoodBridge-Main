import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotificationsPolling } from './useNotificationsPolling';
import notificationsService from '../services/notificationsService';
import type { Notification } from '../types/notifications';

// Mock the notificationsService
vi.mock('../services/notificationsService', () => ({
  default: {
    getNotifications: vi.fn(),
  },
}));

const mockNotifications: Notification[] = [
  {
    notification_id: 'notif-1',
    user_id: 'user-1',
    type: 'reservation',
    message: 'Your reservation has been confirmed',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    notification_id: 'notif-2',
    user_id: 'user-1',
    type: 'pantry',
    message: 'Pantry appointment confirmed',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

describe('useNotificationsPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch notifications when userId is undefined', () => {
    const onUpdate = vi.fn();
    renderHook(() => useNotificationsPolling(undefined, onUpdate, true));

    expect(notificationsService.getNotifications).not.toHaveBeenCalled();
  });

  it('should not fetch notifications when enabled is false', () => {
    const onUpdate = vi.fn();
    renderHook(() => useNotificationsPolling('user-1', onUpdate, false));

    expect(notificationsService.getNotifications).not.toHaveBeenCalled();
  });

  it('should call onNotificationsUpdate with sorted notifications', async () => {
    const onUpdate = vi.fn();
    vi.mocked(notificationsService.getNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotificationsPolling('user-1', onUpdate, true));

    // Call the returned function manually
    await result.current.fetchNotifications();

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const sortedNotifications = onUpdate.mock.calls[0][0];
      // Should be sorted by timestamp descending (most recent first)
      // notif-2 is more recent (2 min ago) than notif-1 (5 min ago)
      expect(sortedNotifications[0].notification_id).toBe('notif-2');
      expect(sortedNotifications[1].notification_id).toBe('notif-1');
    });
  });

  it('should return fetchNotifications function', () => {
    const onUpdate = vi.fn();
    vi.mocked(notificationsService.getNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotificationsPolling('user-1', onUpdate, true));

    expect(result.current).toHaveProperty('fetchNotifications');
    expect(typeof result.current.fetchNotifications).toBe('function');
  });

  it('should allow manual fetch via returned function', async () => {
    const onUpdate = vi.fn();
    vi.mocked(notificationsService.getNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotificationsPolling('user-1', onUpdate, true));

    // Call the returned function manually
    await result.current.fetchNotifications();

    await waitFor(() => {
      expect(notificationsService.getNotifications).toHaveBeenCalled();
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('should sort notifications by timestamp descending', async () => {
    const onUpdate = vi.fn();
    const unsortedNotifications: Notification[] = [
      {
        notification_id: 'notif-1',
        user_id: 'user-1',
        type: 'reservation',
        message: 'Oldest',
        is_read: false,
        created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        notification_id: 'notif-2',
        user_id: 'user-1',
        type: 'pantry',
        message: 'Newest',
        is_read: false,
        created_at: new Date(Date.now() - 1 * 60000).toISOString(),
      },
      {
        notification_id: 'notif-3',
        user_id: 'user-1',
        type: 'listing',
        message: 'Middle',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ];

    vi.mocked(notificationsService.getNotifications).mockResolvedValue(unsortedNotifications);

    const { result } = renderHook(() => useNotificationsPolling('user-1', onUpdate, true));

    await result.current.fetchNotifications();

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const sortedNotifications = onUpdate.mock.calls[0][0];
      // Should be sorted by timestamp descending (most recent first)
      expect(sortedNotifications[0].notification_id).toBe('notif-2'); // Newest
      expect(sortedNotifications[1].notification_id).toBe('notif-3'); // Middle
      expect(sortedNotifications[2].notification_id).toBe('notif-1'); // Oldest
    });
  });

  it('should handle API errors gracefully', async () => {
    const onUpdate = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(notificationsService.getNotifications).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useNotificationsPolling('user-1', onUpdate, true));

    await result.current.fetchNotifications();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error polling notifications:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
