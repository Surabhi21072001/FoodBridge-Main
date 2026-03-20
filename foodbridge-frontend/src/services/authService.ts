import api from './api';
import type { User, LoginCredentials, RegisterData, LoginResponse } from '../types/auth';

/**
 * Authentication Service
 * Handles user authentication operations including login, register, logout, and token management
 */
class AuthService {
  /**
   * Login user with email and password
   * Stores JWT token and user data in session storage on success
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<any>('/auth/login', credentials);

      // Extract token and user from nested data structure
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;

      // Store JWT token in both storages for resilience across HMR reloads
      if (token) {
        sessionStorage.setItem('jwt_token', token);
        localStorage.setItem('jwt_token', token);
      }

      // Store user data in both storages
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      // Clear any existing tokens on login failure
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Register new user
   * Creates a new user account with the provided data
   */
  async register(data: RegisterData): Promise<void> {
    try {
      await api.post('/auth/register', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   * Clears JWT token and user data from session storage
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Get current authenticated user
   * Returns user data from session storage, falls back to localStorage
   */
  async getCurrentUser(): Promise<User | null> {
    // Try sessionStorage first, fall back to localStorage
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        // Re-sync to sessionStorage if it was missing
        sessionStorage.setItem('user', userStr);
        return user;
      } catch (error) {
        this.clearAuthData();
        return null;
      }
    }
    return null;
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    // Try sessionStorage first, fall back to localStorage
    const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (token) {
      // Re-sync to sessionStorage if it was missing
      sessionStorage.setItem('jwt_token', token);
    }
    return token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Clear all authentication data from session and local storage
   */
  private clearAuthData(): void {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
