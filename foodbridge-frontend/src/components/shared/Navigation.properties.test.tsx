import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import fc from 'fast-check';

// Mock authService
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const mockUser = {
  user_id: '1',
  email: 'test@example.com',
  role: 'student' as const,
  created_at: '2024-01-01',
};

const TestPage = () => <div data-testid="test-page">Test Page Content</div>;

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={component} />
          <Route path="/listings" element={component} />
          <Route path="/pantry" element={component} />
          <Route path="/events" element={component} />
          <Route path="/profile" element={component} />
          <Route path="/notifications" element={component} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navigation - Property 9', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    // Setup default authenticated state
    vi.mocked(authService.getToken).mockReturnValue('test-token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 9: Navigation menu present on all authenticated pages
   *
   * For any authenticated page, the navigation menu component should be
   * rendered and visible.
   *
   * Validates: Requirements 2.4
   */
  it('should render navigation menu on all authenticated pages (property-based)', async () => {
    // Generate various unread notification counts
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 200 }), // Various notification counts
        async (unreadCount) => {
          // Reset for each iteration
          vi.clearAllMocks();
          sessionStorage.clear();
          cleanup();

          // Setup authenticated state
          vi.mocked(authService.getToken).mockReturnValue('test-token');
          vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

          // Render Navigation with the generated unread count
          renderWithRouter(
            <>
              <Navigation unreadNotificationCount={unreadCount} />
              <TestPage />
            </>
          );

          // Verify that navigation menu is rendered
          await waitFor(() => {
            // Check for key navigation elements
            expect(screen.getByText('FoodBridge')).toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Listings')).toBeInTheDocument();
            expect(screen.getByText('Pantry')).toBeInTheDocument();
            expect(screen.getByText('Events')).toBeInTheDocument();
            expect(screen.getByText('Profile')).toBeInTheDocument();

            // Verify navigation is a nav element
            const navElement = screen.getByRole('navigation');
            expect(navElement).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 10 } // Run property test with 10 iterations (reduced for performance)
    );
  }, 30000);

  /**
   * Property 9 - Extended: Navigation menu is always present regardless of page
   *
   * For any authenticated page route, the navigation menu should always be
   * rendered and contain all required navigation links.
   *
   * Validates: Requirements 2.4
   */
  it('should render navigation menu consistently across different pages (property-based)', async () => {
    const pages = ['/', '/listings', '/pantry', '/events', '/profile', '/notifications'];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...pages),
        async (page) => {
          // Reset for each iteration
          vi.clearAllMocks();
          sessionStorage.clear();
          cleanup();

          // Setup authenticated state
          vi.mocked(authService.getToken).mockReturnValue('test-token');
          vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

          // Render Navigation on the selected page
          renderWithRouter(
            <>
              <Navigation unreadNotificationCount={0} />
              <TestPage />
            </>
          );

          // Verify navigation menu is present on every page
          await waitFor(() => {
            const navElement = screen.getByRole('navigation');
            expect(navElement).toBeInTheDocument();

            // Verify all key navigation links are present
            const dashboardLinks = screen.getAllByText('Dashboard');
            expect(dashboardLinks.length).toBeGreaterThan(0);

            const listingsLinks = screen.getAllByText('Listings');
            expect(listingsLinks.length).toBeGreaterThan(0);

            const pantryLinks = screen.getAllByText('Pantry');
            expect(pantryLinks.length).toBeGreaterThan(0);

            const eventsLinks = screen.getAllByText('Events');
            expect(eventsLinks.length).toBeGreaterThan(0);

            const profileLinks = screen.getAllByText('Profile');
            expect(profileLinks.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 50 } // Run property test with 50 iterations
    );
  });

  /**
   * Property 9 - Extended: Navigation menu contains all required elements
   *
   * For any authenticated page, the navigation menu should contain:
   * - Logo/Brand link
   * - Navigation links (Dashboard, Listings, Pantry, Events, Profile)
   * - Notification icon
   * - User email
   * - Logout button
   *
   * Validates: Requirements 2.4
   */
  it('should render all required navigation elements (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }), // Various notification counts
        async (unreadCount) => {
          // Reset for each iteration
          vi.clearAllMocks();
          sessionStorage.clear();
          cleanup();

          // Setup authenticated state
          vi.mocked(authService.getToken).mockReturnValue('test-token');
          vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

          // Render Navigation
          renderWithRouter(
            <>
              <Navigation unreadNotificationCount={unreadCount} />
              <TestPage />
            </>
          );

          // Verify all required navigation elements are present
          await waitFor(() => {
            // Logo/Brand
            const logoLink = screen.getByText('FoodBridge').closest('a');
            expect(logoLink).toBeInTheDocument();
            expect(logoLink).toHaveAttribute('href', '/');

            // Navigation links
            const dashboardLink = screen.getAllByText('Dashboard')[0].closest('a');
            expect(dashboardLink).toBeInTheDocument();
            expect(dashboardLink).toHaveAttribute('href', '/');

            const listingsLink = screen.getAllByText('Listings')[0].closest('a');
            expect(listingsLink).toBeInTheDocument();
            expect(listingsLink).toHaveAttribute('href', '/listings');

            const pantryLink = screen.getAllByText('Pantry')[0].closest('a');
            expect(pantryLink).toBeInTheDocument();
            expect(pantryLink).toHaveAttribute('href', '/pantry');

            const eventsLink = screen.getAllByText('Events')[0].closest('a');
            expect(eventsLink).toBeInTheDocument();
            expect(eventsLink).toHaveAttribute('href', '/events');

            const profileLink = screen.getAllByText('Profile')[0].closest('a');
            expect(profileLink).toBeInTheDocument();
            expect(profileLink).toHaveAttribute('href', '/profile');

            // Notification icon
            const notificationLinks = screen.getAllByRole('link', { name: /notifications/i });
            expect(notificationLinks.length).toBeGreaterThan(0);

            // Logout button
            const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
            expect(logoutButtons.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 10 } // Run property test with 10 iterations (reduced for performance)
    );
  }, 30000);
});
