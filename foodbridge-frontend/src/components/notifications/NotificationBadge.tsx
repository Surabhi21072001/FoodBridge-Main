import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import notificationsService from '../../services/notificationsService';

/**
 * NotificationBadge Component
 * Displays unread notification count in the navigation menu
 * Updates count when new notifications arrive (via polling)
 * 
 * Validates: Requirements 8.4, 8.5
 */
const NotificationBadge: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    // Fetch immediately on mount
    fetchUnreadCount();

    // Set up polling to check for new notifications every 30 seconds
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(pollInterval);
  }, [user?.id]);

  return (
    <Link
      to="/notifications"
      className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span
          className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-danger-600 rounded-full"
          aria-label={`${unreadCount} unread notifications`}
          data-testid="notification-badge-count"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBadge;
