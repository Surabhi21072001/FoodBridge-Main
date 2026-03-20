import React from 'react';
import type { Notification } from '../../types/notifications';

export interface CompactNotificationItemProps {
  notification: Notification;
}

/**
 * Compact version of NotificationItem for displaying in chat results.
 * Shows notification message and type in a condensed format suitable for chat display.
 * Requirement 10.6: Display tool results in a formatted manner
 */
const CompactNotificationItem: React.FC<CompactNotificationItemProps> = ({
  notification,
}) => {
  // Get icon based on notification type
  const getNotificationIcon = (type: string): string => {
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
    });
  };

  // Get background color based on read status
  const getBackgroundColor = (): string => {
    return notification.is_read
      ? 'bg-gray-50 border-gray-200'
      : 'bg-blue-50 border-blue-200';
  };

  return (
    <div
      className={`flex items-start gap-2 p-2 border rounded-lg transition-colors ${getBackgroundColor()}`}
      data-testid={`compact-notification-item-${notification.notification_id}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-lg mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs ${
            notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'
          } line-clamp-2`}
        >
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatTimestamp(notification.created_at)}
        </p>
      </div>

      {/* Read indicator */}
      {!notification.is_read && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
      )}
    </div>
  );
};

export default CompactNotificationItem;
