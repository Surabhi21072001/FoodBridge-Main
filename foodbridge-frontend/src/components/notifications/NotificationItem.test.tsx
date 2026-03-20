import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NotificationItem from './NotificationItem';
import notificationsService from '../../services/notificationsService';
import type { Notification } from '../../types/notifications';

// Mock the notificationsService
vi.mock('../../services/notificationsService');

const mockNotificationsService = vi.mocked(notificationsService);

describe('NotificationItem', () => {
  const mockNotification: Notification = {
    notification_id: 'notif-1',
    user_id: 'user-1',
    type: 'reservation',
    message: 'Your reservation has been confirmed',
    is_read: false,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render notification with message', () => {
      render(<NotificationItem notification={mockNotification} />);
      expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
    });

    it('should display notification icon based on type', () => {
      render(<NotificationItem notification={mockNotification} />);
      const icon = screen.getByText('📦'); // reservation icon
      expect(icon).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<NotificationItem notification={mockNotification} />);
      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('should render with correct data-testid', () => {
      render(<NotificationItem notification={mockNotification} />);
      expect(screen.getByTestId('notification-item-notif-1')).toBeInTheDocument();
    });

    it('should have correct background color for unread notification', () => {
      const { container } = render(<NotificationItem notification={mockNotification} />);
      const notificationDiv = container.querySelector('[data-testid="notification-item-notif-1"]');
      expect(notificationDiv).toHaveClass('bg-blue-50');
    });

    it('should have correct background color for read notification', () => {
      const readNotification: Notification = {
        ...mockNotification,
        is_read: true,
      };
      const { container } = render(<NotificationItem notification={readNotification} />);
      const notificationDiv = container.querySelector('[data-testid="notification-item-notif-1"]');
      expect(notificationDiv).toHaveClass('bg-gray-50');
    });

    it('should display different icons for different notification types', () => {
      const types = [
        { type: 'listing', icon: '🍽️' },
        { type: 'pantry', icon: '🥫' },
        { type: 'event', icon: '🎉' },
        { type: 'volunteer', icon: '🤝' },
        { type: 'alert', icon: '⚠️' },
        { type: 'success', icon: '✅' },
        { type: 'error', icon: '❌' },
      ];

      types.forEach(({ type, icon }) => {
        const { unmount } = render(
          <NotificationItem
            notification={{
              ...mockNotification,
              type,
            }}
          />
        );
        expect(screen.getByText(icon)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Mark as Read', () => {
    it('should display mark as read button for unread notifications', () => {
      render(<NotificationItem notification={mockNotification} />);
      expect(screen.getByTestId('mark-read-button-notif-1')).toBeInTheDocument();
    });

    it('should not display mark as read button for read notifications', () => {
      const readNotification: Notification = {
        ...mockNotification,
        is_read: true,
      };
      render(<NotificationItem notification={readNotification} />);
      expect(screen.queryByTestId('mark-read-button-notif-1')).not.toBeInTheDocument();
    });

    it('should call markAsRead service when mark as read button is clicked', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);
      const onMarkAsRead = vi.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={onMarkAsRead}
        />
      );

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      fireEvent.click(markReadButton);

      await waitFor(() => {
        expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should call onMarkAsRead callback after successful mark as read', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);
      const onMarkAsRead = vi.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={onMarkAsRead}
        />
      );

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      fireEvent.click(markReadButton);

      await waitFor(() => {
        expect(onMarkAsRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should disable buttons while marking as read', async () => {
      mockNotificationsService.markAsRead.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<NotificationItem notification={mockNotification} />);

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      const deleteButton = screen.getByTestId('delete-button-notif-1');

      fireEvent.click(markReadButton);

      expect(markReadButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();

      await waitFor(() => {
        expect(markReadButton).not.toBeDisabled();
      });
    });
  });

  describe('Delete', () => {
    it('should display delete button', () => {
      render(<NotificationItem notification={mockNotification} />);
      expect(screen.getByTestId('delete-button-notif-1')).toBeInTheDocument();
    });

    it('should call deleteNotification service when delete button is clicked', async () => {
      mockNotificationsService.deleteNotification.mockResolvedValue(undefined);
      const onDelete = vi.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onDelete={onDelete}
        />
      );

      const deleteButton = screen.getByTestId('delete-button-notif-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockNotificationsService.deleteNotification).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should call onDelete callback after successful deletion', async () => {
      mockNotificationsService.deleteNotification.mockResolvedValue(undefined);
      const onDelete = vi.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onDelete={onDelete}
        />
      );

      const deleteButton = screen.getByTestId('delete-button-notif-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should disable buttons while deleting', async () => {
      mockNotificationsService.deleteNotification.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<NotificationItem notification={mockNotification} />);

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      const deleteButton = screen.getByTestId('delete-button-notif-1');

      fireEvent.click(deleteButton);

      expect(markReadButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();

      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('Timestamp Formatting', () => {
    it('should display "just now" for very recent notifications', () => {
      const recentNotification: Notification = {
        ...mockNotification,
        created_at: new Date().toISOString(),
      };
      render(<NotificationItem notification={recentNotification} />);
      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('should display minutes ago for notifications from minutes ago', () => {
      const minutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
      const notification: Notification = {
        ...mockNotification,
        created_at: minutesAgo,
      };
      render(<NotificationItem notification={notification} />);
      expect(screen.getByText('5m ago')).toBeInTheDocument();
    });

    it('should display hours ago for notifications from hours ago', () => {
      const hoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
      const notification: Notification = {
        ...mockNotification,
        created_at: hoursAgo,
      };
      render(<NotificationItem notification={notification} />);
      expect(screen.getByText('3h ago')).toBeInTheDocument();
    });

    it('should display days ago for notifications from days ago', () => {
      const daysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      const notification: Notification = {
        ...mockNotification,
        created_at: daysAgo,
      };
      render(<NotificationItem notification={notification} />);
      expect(screen.getByText('2d ago')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NotificationItem notification={mockNotification} />);
      const notificationDiv = screen.getByTestId('notification-item-notif-1');
      expect(notificationDiv).toHaveAttribute('role', 'article');
      expect(notificationDiv).toHaveAttribute(
        'aria-label',
        'Notification: Your reservation has been confirmed'
      );
    });

    it('should have accessible button labels', () => {
      render(<NotificationItem notification={mockNotification} />);
      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      const deleteButton = screen.getByTestId('delete-button-notif-1');

      expect(markReadButton).toHaveAttribute('aria-label', 'Mark as read');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete notification');
    });
  });

  describe('Error Handling', () => {
    it('should handle mark as read errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockNotificationsService.markAsRead.mockRejectedValue(new Error('API Error'));

      render(<NotificationItem notification={mockNotification} />);

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      fireEvent.click(markReadButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to mark notification as read:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle delete errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockNotificationsService.deleteNotification.mockRejectedValue(new Error('API Error'));

      render(<NotificationItem notification={mockNotification} />);

      const deleteButton = screen.getByTestId('delete-button-notif-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to delete notification:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
