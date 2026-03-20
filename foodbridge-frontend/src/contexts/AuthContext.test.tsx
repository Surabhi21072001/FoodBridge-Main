import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '../services/authService';
import type { User, LoginResponse } from '../types/auth';

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should restore auth state from session storage on mount', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for auth state to be restored
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle missing auth data on mount', async () => {
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle errors during auth state restoration', async () => {
      vi.mocked(authService.getToken).mockReturnValue('invalid-token');
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const mockResponse: LoginResponse = {
        token: 'new-token',
        user: {
          user_id: '1',
          email: 'test@example.com',
          role: 'student',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.token).toBe('new-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear state on login failure', async () => {
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrong',
          });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify user is logged in
      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('should be true when both user and token exist', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should be false when user is null', async () => {
      vi.mocked(authService.getToken).mockReturnValue('test-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should be false when token is null', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
