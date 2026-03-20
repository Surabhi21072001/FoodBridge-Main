import React, { useState } from 'react';
import type { Notification } from '../../types/notifications';
import notificationsService from '../../services/notificationsService';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
}

/**
 * NotificationItem Component
 * Displays a single notification with type icon, message, timestamp
 * Handles mark as read and delete actions
 * Validates: Requirements 8.2, 8.3
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Format timestamp
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleMarkAsRead = async () => {
    if (notification.is_read) return;

    setIsMarkingRead(true);
    try {
      await notificationsService.markAsRead(notification.notification_id);
      onMarkAsRead?.(notification.notification_id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await notificationsService.deleteNotification(notification.notification_id);
      onDelete?.(notification.notification_id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{
        backgroundColor: notification.is_read ? '#fdf6ee' : '#fff3e8',
        borderLeft: notification.is_read ? 'none' : '3px solid #ff6b35',
      }}
      data-testid={`notification-item-${notification.notification_id}`}
      role="article"
      aria-label={`Notification: ${notification.message}`}
    >
      {/* Icon */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: notification.is_read ? '#f0e0cc' : '#ff6b35',
          color: notification.is_read ? '#2d2d2d' : 'white',
        }}
      >
        🔔
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#2d2d2d' }}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatTimestamp(notification.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1">
        {!notification.is_read && (
          <button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead || isDeleting}
            data-testid={`mark-read-button-${notification.notification_id}`}
            aria-label="Mark as read"
            title="Mark as read"
            className="w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-orange-100 transition-colors text-gray-400 hover:text-orange-500"
          >
            ✓
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting || isMarkingRead}
          data-testid={`delete-button-${notification.notification_id}`}
          aria-label="Delete notification"
          title="Delete"
          className="w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-100 transition-colors text-gray-400 hover:text-red-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
