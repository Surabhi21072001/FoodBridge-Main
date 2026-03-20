import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
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
  id: 'user-1',
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

describe('NotificationBadge - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    // Setup default mocks for auth restoration
    vi.mocked(authService.getToken).mockReturnValue('test-token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  });

  /**
   * Property 39: Notification badge displays unread count
   * For any user with unread notifications, the notification badge in the navigation menu
   * should display the count of unread notifications.
   * 
   * Validates: Requirements 8.4
   */
  it('should display unread count for any valid count value', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 1000 }), async (unreadCount) => {
        cleanup();
        vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(unreadCount);

        renderWithAuth(<NotificationBadge />);

        const badge = await screen.findByTestId('notification-badge-count');
        expect(badge).toBeInTheDocument();

        // Verify the displayed count is correct (capped at 99+)
        const displayedText = badge.textContent;
        if (unreadCount > 99) {
          expect(displayedText).toBe('99+');
        } else {
          expect(displayedText).toBe(unreadCount.toString());
        }
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Badge is hidden when unread count is 0
   * For any user with 0 unread notifications, the badge should not be displayed.
   */
  it('should not display badge when unread count is 0', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(0), async (unreadCount) => {
        cleanup();
        vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(unreadCount);

        renderWithAuth(<NotificationBadge />);

        await waitFor(() => {
          const badge = screen.queryByTestId('notification-badge-count');
          expect(badge).not.toBeInTheDocument();
        });
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Badge caps display at 99+
   * For any count >= 100, the badge should display "99+".
   */
  it('should display 99+ for counts >= 100', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 100, max: 10000 }), async (unreadCount) => {
        cleanup();
        vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(unreadCount);

        renderWithAuth(<NotificationBadge />);

        const badge = await screen.findByTestId('notification-badge-count');
        expect(badge).toHaveTextContent('99+');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Badge is always accessible
   * For any unread count, the badge should have proper accessibility attributes.
   */
  it('should have accessible aria-label for any count', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 100 }), async (unreadCount) => {
        cleanup();
        vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(unreadCount);

        renderWithAuth(<NotificationBadge />);

        const badge = await screen.findByTestId('notification-badge-count');
        expect(badge).toHaveAttribute('aria-label');
        const ariaLabel = badge.getAttribute('aria-label');
        expect(ariaLabel).toContain(unreadCount.toString());
      }),
      { numRuns: 20 }
    );
  });
});
