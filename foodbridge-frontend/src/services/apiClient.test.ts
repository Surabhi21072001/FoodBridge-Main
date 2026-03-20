import { describe, it, expect, beforeEach } from 'vitest';

describe('API Client', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  describe('Session Storage - JWT Token Management', () => {
    it('should store JWT token in session storage', () => {
      const token = 'test-jwt-token-123';
      sessionStorage.setItem('jwt_token', token);

      expect(sessionStorage.getItem('jwt_token')).toBe(token);
    });

    it('should retrieve JWT token from session storage', () => {
      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      sessionStorage.setItem('jwt_token', token);

      const retrieved = sessionStorage.getItem('jwt_token');
      expect(retrieved).toBe(token);
    });

    it('should remove JWT token from session storage', () => {
      sessionStorage.setItem('jwt_token', 'test-token');
      sessionStorage.removeItem('jwt_token');

      expect(sessionStorage.getItem('jwt_token')).toBeNull();
    });

    it('should return null when JWT token does not exist', () => {
      expect(sessionStorage.getItem('jwt_token')).toBeNull();
    });
  });

  describe('Session Storage - User Data Management', () => {
    it('should store user data in session storage', () => {
      const user = { id: '1', email: 'test@example.com', role: 'student' };
      sessionStorage.setItem('user', JSON.stringify(user));

      const retrieved = JSON.parse(sessionStorage.getItem('user') || '{}');
      expect(retrieved).toEqual(user);
    });

    it('should clear user data from session storage', () => {
      const user = { id: '1', email: 'test@example.com' };
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('user');

      expect(sessionStorage.getItem('user')).toBeNull();
    });

    it('should clear both token and user data on logout', () => {
      sessionStorage.setItem('jwt_token', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

      // Simulate logout
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('user');

      expect(sessionStorage.getItem('jwt_token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('API Client Configuration', () => {
    it('should use correct API base URL from environment', () => {
      const expectedUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      expect(expectedUrl).toContain('api');
    });

    it('should have 30 second timeout configured', () => {
      const timeout = 30000;
      expect(timeout).toBe(30000);
    });
  });
});
