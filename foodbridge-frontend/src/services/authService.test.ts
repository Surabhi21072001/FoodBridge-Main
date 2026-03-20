import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './authService';
import api from './api';
import type { User, LoginResponse } from '../types/auth';

// Mock the API
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token and user', async () => {
      const mockResponse: LoginResponse = {
        token: 'test-jwt-token',
        user: {
          user_id: '1',
          email: 'test@example.com',
          role: 'student',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
      expect(sessionStorage.getItem('jwt_token')).toBe('test-jwt-token');
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(mockResponse.user));
    });

    it('should clear auth data on login failure', async () => {
      // Pre-populate session storage
      sessionStorage.setItem('jwt_token', 'old-token');
      sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

      vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');

      expect(sessionStorage.getItem('jwt_token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      vi.mocked(api.post).mockResolvedValue(undefined);

      await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student',
      });
    });

    it('should throw error on registration failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Email already exists'));

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          role: 'student',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear all auth data', () => {
      sessionStorage.setItem('jwt_token', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

      authService.logout();

      expect(sessionStorage.getItem('jwt_token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from session storage', async () => {
      const mockUser: User = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      };

      sessionStorage.setItem('user', JSON.stringify(mockUser));

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(api.get).not.toHaveBeenCalled();
    });

    it('should return null if no token and no user in session storage', async () => {
      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(api.get).not.toHaveBeenCalled();
    });

    it('should return null and clear auth data if user JSON is invalid', async () => {
      sessionStorage.setItem('user', 'invalid-json');

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(sessionStorage.getItem('jwt_token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });

    it('should handle invalid JSON in session storage', async () => {
      sessionStorage.setItem('user', 'invalid-json{');

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from session storage', () => {
      sessionStorage.setItem('jwt_token', 'test-token');

      const token = authService.getToken();

      expect(token).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when both token and user exist', () => {
      sessionStorage.setItem('jwt_token', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when token is missing', () => {
      sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when user is missing', () => {
      sessionStorage.setItem('jwt_token', 'test-token');

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when both are missing', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
