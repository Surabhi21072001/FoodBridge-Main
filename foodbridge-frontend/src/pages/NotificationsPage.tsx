import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useToast from '../hooks/useToast';
import { useNotificationsPolling } from '../hooks/useNotificationsPolling';
import notificationsService from '../services/notificationsService';
import type { Notification } from '../types/notifications';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import NotificationItem from '../components/notifications/NotificationItem';

/**
 * NotificationsPage Component
 * Displays notifications ordered by timestamp, grouped by type
 * Implements real-time polling for new notifications every 30 seconds
 * Validates: Requirements 8.1, 8.4, 8.5, 8.6
 */
const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Set up polling for real-time notification updates
  useNotificationsPolling(user?.id, setNotifications, true);

  useEffect(() => {
    // Prevent multiple API calls on component mount
    if (hasInitialized.current || !user) return;
    hasInitialized.current = true;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationsService.getNotifications(user.id);
        // Sort by timestamp descending (most recent first)
        const sorted = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
      } catch (error) {
        showToast('Failed to load notifications', 'error');
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, showToast]);

  // Group notifications by type
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach((notification) => {
      const type = notification.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(notification);
    });
    return groups;
  }, [notifications]);

  // Get sorted type keys for consistent ordering
  const sortedTypes = useMemo(() => {
    return Object.keys(groupedNotifications).sort();
  }, [groupedNotifications]);

  // Get type icon
  const getTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'reservation':
        return '📦';
      case 'listing':
        return '🍽️';
      case 'pantry':
        return '🥫';
      case 'event':
        return '🎉';
      case 'volunteer':
        return '🤝';
      case 'alert':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📬';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.notification_id !== notificationId)
    );
    showToast('Notification deleted', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '24px' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d', fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage your notifications.</p>
      </div>

      {notifications.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#fff' }}
          data-testid="empty-state"
        >
          <p className="text-gray-500">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTypes.map((type) => (
            <div key={type} data-testid={`notification-group-${type}`}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xl">{getTypeIcon(type)}</span>
                <h2 className="text-base font-bold capitalize" style={{ color: '#2d2d2d', fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>
                  {type.replace(/_/g, ' ')}
                </h2>
                <span className="ml-auto text-xs text-gray-400">
                  {groupedNotifications[type].length}
                </span>
              </div>
              {/* Cards */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', padding: '12px' }}>
                <div className="space-y-2">
                  {groupedNotifications[type].map((notification) => (
                    <NotificationItem
                      key={notification.notification_id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
