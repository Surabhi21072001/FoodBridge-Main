import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationBadge from './NotificationBadge';
import { AuthProvider } from '../../contexts/AuthContext';
import notificationsService from '../../services/notificationsService';
import authService from '../../services/authService';
import type { User } from '../../types/auth';

// Mock the notificationsService
vi.mock('../../services/notificationsService', () => ({
  default: {
    getUnreadCount: vi.fn(),
  },
}));

// Mock the authService
vi.mock('../../services/authService', () => ({
  default: {
    getToken: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockUser: User = {
  user_id: 'user-1',
  email: 'test@example.com',
  role: 'student',
  created_at: '2024-01-01T00:00:00Z',
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('NotificationBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('test-token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  });

  it('should render notification icon', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(0);

    renderWithAuth(<NotificationBadge />);

    await waitFor(() => {
      const icon = screen.getByRole('link', { name: /notifications/i });
      expect(icon).toBeInTheDocument();
    });
  });

  it('should display unread count badge when count > 0', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(5);

    renderWithAuth(<NotificationBadge />);

    const badge = await screen.findByTestId('notification-badge-count');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('5');
  });

  it('should not display badge when count is 0', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(0);

    renderWithAuth(<NotificationBadge />);

    await waitFor(() => {
      const badge = screen.queryByTestId('notification-badge-count');
      expect(badge).not.toBeInTheDocument();
    });
  });

  it('should display 99+ when count exceeds 99', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(150);

    renderWithAuth(<NotificationBadge />);

    const badge = await screen.findByTestId('notification-badge-count');
    expect(badge).toHaveTextContent('99+');
  });

  it('should fetch unread count on mount', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(3);

    renderWithAuth(<NotificationBadge />);

    await waitFor(() => {
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith('user-1');
    });
  });

  it('should link to notifications page', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(0);

    renderWithAuth(<NotificationBadge />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /notifications/i });
      expect(link).toHaveAttribute('href', '/notifications');
    });
  });

  it('should have proper accessibility attributes', async () => {
    vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(3);

    renderWithAuth(<NotificationBadge />);

    const badge = await screen.findByTestId('notification-badge-count');
    expect(badge).toHaveAttribute('aria-label', '3 unread notifications');
  });
});
