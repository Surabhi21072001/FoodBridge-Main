import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import type { User } from '../../types/auth';

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

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('authentication state', () => {
    it('should show loading spinner while auth state is being restored', () => {
      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', async () => {
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('role-based access control', () => {
    it('should redirect to login when user role does not match required role', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute requiredRole="provider">
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should redirect to login when auth restoration fails', async () => {
      vi.mocked(authService.getToken).mockReturnValue('invalid-token');
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
