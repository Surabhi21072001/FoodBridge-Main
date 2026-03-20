import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
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

// Mock LoadingSpinner to avoid rendering issues
vi.mock('../shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute - Property 7', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 7: Unauthenticated users are redirected from protected routes
   *
   * For any unauthenticated user attempting to access a protected route,
   * the application should redirect to the login page.
   *
   * Validates: Requirements 2.2
   */
  it('should redirect unauthenticated users to login page (property-based)', async () => {
    // Generate various unauthenticated states
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Case 1: No token and no user
          fc.constant({ token: null, user: null }),
          // Case 2: Token exists but user is null (invalid state)
          fc.constant({ token: 'some-token', user: null }),
          // Case 3: User exists but token is null (invalid state)
          fc.constant({ token: null, user: { user_id: '1', email: 'test@example.com', role: 'student', created_at: '2024-01-01' } })
        ),
        async ({ token, user }) => {
          // Reset mocks and storage for each iteration
          vi.clearAllMocks();
          sessionStorage.clear();
          cleanup();

          // Setup mocks for this test case
          vi.mocked(authService.getToken).mockReturnValue(token);
          vi.mocked(authService.getCurrentUser).mockResolvedValue(user);

          // Render the protected route
          renderWithRouter(
            <AuthProvider>
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            </AuthProvider>
          );

          // Verify that the login page is rendered (redirect occurred)
          // and the protected content is NOT rendered
          await waitFor(() => {
            const loginPage = screen.queryByTestId('login-page');
            const protectedContent = screen.queryByTestId('protected-content');

            // For property-based testing, we assert that:
            // 1. Login page is rendered
            // 2. Protected content is NOT rendered
            expect(loginPage).toBeInTheDocument();
            expect(protectedContent).not.toBeInTheDocument();
          });
        }
      ),
      { numRuns: 100 } // Run property test with 100 iterations
    );
  });

  /**
   * Property 7 - Extended: Unauthenticated users are always redirected regardless of route
   *
   * For any unauthenticated state and any protected route,
   * the user should always be redirected to login.
   *
   * Validates: Requirements 2.2
   */
  it('should consistently redirect unauthenticated users across multiple renders (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // Number of render attempts
        async (renderCount) => {
          for (let i = 0; i < renderCount; i++) {
            // Reset mocks for each iteration
            vi.clearAllMocks();
            sessionStorage.clear();
            cleanup();

            // Setup unauthenticated state
            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

            // Render the protected route
            renderWithRouter(
              <AuthProvider>
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              </AuthProvider>
            );

            // Verify redirect occurs
            await waitFor(() => {
              expect(screen.getByTestId('login-page')).toBeInTheDocument();
              expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            });
          }
        }
      ),
      { numRuns: 50 } // Run property test with 50 iterations
    );
  });
});
