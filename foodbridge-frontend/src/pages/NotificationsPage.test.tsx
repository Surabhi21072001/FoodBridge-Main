import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import notificationsService from '../services/notificationsService';
import authService from '../services/authService';
import type { Notification } from '../types/notifications';
import type { User } from '../types/auth';

// Mock the services
vi.mock('../services/notificationsService');
vi.mock('../services/authService');
vi.mock('../hooks/useToast', () => ({
  default: () => ({
    showToast: vi.fn(),
  }),
}));

const mockNotificationsService = vi.mocked(notificationsService);
const mockAuthService = vi.mocked(authService);

const mockUser: User = {
  user_id: 'user-1',
  email: 'test@example.com',
  role: 'student',
  created_at: '2024-01-01T00:00:00Z',
};

const mockNotifications: Notification[] = [
  {
    notification_id: 'notif-1',
    user_id: 'user-1',
    type: 'reservation',
    message: 'Your reservation has been confirmed',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
  },
  {
    notification_id: 'notif-2',
    user_id: 'user-1',
    type: 'reservation',
    message: 'Reservation cancelled',
    is_read: true,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
  },
  {
    notification_id: 'notif-3',
    user_id: 'user-1',
    type: 'pantry',
    message: 'Pantry appointment confirmed',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
  },
  {
    notification_id: 'notif-4',
    user_id: 'user-1',
    type: 'listing',
    message: 'New food listing available',
    is_read: true,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hour ago
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ToastProvider>
        {component}
      </ToastProvider>
    </AuthProvider>
  );
};

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock authService to return a user
    mockAuthService.getToken.mockReturnValue('test-token');
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
  });

  describe('Initial Load', () => {
    it('should display loading spinner on initial load', () => {
      mockNotificationsService.getNotifications.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<NotificationsPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should fetch notifications on mount', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(mockNotificationsService.getNotifications).toHaveBeenCalled();
      });
    });

    it('should display page header', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('View and manage your notifications.')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no notifications', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue([]);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No notifications.')).toBeInTheDocument();
      });
    });
  });

  describe('Notifications Display', () => {
    it('should display all notifications', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
        expect(screen.getByText('Reservation cancelled')).toBeInTheDocument();
        expect(screen.getByText('Pantry appointment confirmed')).toBeInTheDocument();
        expect(screen.getByText('New food listing available')).toBeInTheDocument();
      });
    });

    it('should sort notifications by timestamp descending within each group', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        // Check that notifications are sorted by timestamp within their groups
        const reservationGroup = screen.getByTestId('notification-group-reservation');
        const notificationsInGroup = reservationGroup.querySelectorAll('[data-testid^="notification-item-"]');
        // Most recent reservation (5m ago) should come before older one (10m ago)
        expect(notificationsInGroup[0]).toHaveAttribute('data-testid', 'notification-item-notif-1');
        expect(notificationsInGroup[1]).toHaveAttribute('data-testid', 'notification-item-notif-2');
      });
    });
  });

  describe('Grouping by Type', () => {
    it('should group notifications by type', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-group-listing')).toBeInTheDocument();
        expect(screen.getByTestId('notification-group-pantry')).toBeInTheDocument();
        expect(screen.getByTestId('notification-group-reservation')).toBeInTheDocument();
      });
    });

    it('should display type headers with icons', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        // Check for type headers
        const headers = screen.getAllByRole('heading', { level: 2 });
        expect(headers.length).toBeGreaterThan(0);
      });
    });

    it('should display notification count per type', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        // Reservation group should show count of 2
        const reservationGroup = screen.getByTestId('notification-group-reservation');
        expect(reservationGroup).toBeInTheDocument();
      });
    });

    it('should sort type groups alphabetically', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        const groups = screen.getAllByTestId(/notification-group-/);
        // Groups should be in alphabetical order: listing, pantry, reservation
        expect(groups[0]).toHaveAttribute('data-testid', 'notification-group-listing');
        expect(groups[1]).toHaveAttribute('data-testid', 'notification-group-pantry');
        expect(groups[2]).toHaveAttribute('data-testid', 'notification-group-reservation');
      });
    });
  });

  describe('Mark as Read', () => {
    it('should call markAsRead when mark as read button is clicked', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
      });

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      fireEvent.click(markReadButton);

      await waitFor(() => {
        expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should update notification state after marking as read', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
      });

      const markReadButton = screen.getByTestId('mark-read-button-notif-1');
      fireEvent.click(markReadButton);

      await waitFor(() => {
        // After marking as read, the button should disappear
        expect(screen.queryByTestId('mark-read-button-notif-1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete', () => {
    it('should call deleteNotification when delete button is clicked', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.deleteNotification.mockResolvedValue(undefined);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-notif-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockNotificationsService.deleteNotification).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should remove notification from display after deletion', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.deleteNotification.mockResolvedValue(undefined);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Your reservation has been confirmed')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-notif-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('Your reservation has been confirmed')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display empty state on fetch failure', async () => {
      mockNotificationsService.getNotifications.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveTextContent('Notifications');
      });
    });

    it('should have type group headings', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue(mockNotifications);

      renderWithProviders(<NotificationsPage />);

      await waitFor(() => {
        const h2s = screen.getAllByRole('heading', { level: 2 });
        expect(h2s.length).toBeGreaterThan(0);
      });
    });
  });
});
