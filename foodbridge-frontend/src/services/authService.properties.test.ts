import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import authService from './authService';
import api from './api';
import type { LoginResponse, User } from '../types/auth';

// Feature: foodbridge-frontend, Property 1: Valid login credentials store JWT token

// Mock the API
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthService Login Flow - Property-Based Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('Property 1: Valid login credentials store JWT token', () => {
    it('should store JWT token for any valid email and password combination', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.uuid(),
          async (email, password, userId) => {
            // Clear mocks for each iteration
            vi.clearAllMocks();
            sessionStorage.clear();

            const mockResponse: LoginResponse = {
              token: `jwt-token-${userId}`,
              user: {
                user_id: userId,
                email: email,
                role: 'student',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            await authService.login({ email, password });

            const storedToken = sessionStorage.getItem('jwt_token');
            return storedToken === mockResponse.token;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should store user data for any valid login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          fc.uuid(),
          fc.constantFrom('student', 'provider', 'admin'),
          async (email, password, userId, role) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const user: User = {
              user_id: userId,
              email: email,
              role: role as 'student' | 'provider' | 'admin',
              created_at: new Date().toISOString(),
            };

            const mockResponse: LoginResponse = {
              token: 'test-token',
              user: user,
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            await authService.login({ email, password });

            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            return (
              parsedUser &&
              parsedUser.user_id === user.user_id &&
              parsedUser.email === user.email &&
              parsedUser.role === user.role
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return login response with token and user for any valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          fc.string({ minLength: 20 }),
          async (email, password, token) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const mockResponse: LoginResponse = {
              token: token,
              user: {
                user_id: '1',
                email: email,
                role: 'student',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            const result = await authService.login({ email, password });

            return result.token === token && result.user.email === email;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Login failure clears auth data', () => {
    it('should clear any existing token on login failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          fc.string({ minLength: 10 }),
          async (email, password, existingToken) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            // Pre-populate session storage with existing token
            sessionStorage.setItem('jwt_token', existingToken);
            sessionStorage.setItem('user', JSON.stringify({ id: '1' }));

            vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

            try {
              await authService.login({ email, password });
              return false; // Should not reach here
            } catch (error) {
              // Verify auth data was cleared
              return (
                sessionStorage.getItem('jwt_token') === null &&
                sessionStorage.getItem('user') === null
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error for any invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 5 }),
          async (email, password, errorMessage) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            vi.mocked(api.post).mockRejectedValue(new Error(errorMessage));

            try {
              await authService.login({ email, password });
              return false;
            } catch (error: any) {
              return error.message === errorMessage;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Token and user data consistency', () => {
    it('should maintain consistency between stored token and user', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          fc.string({ minLength: 20 }),
          fc.uuid(),
          async (email, password, token, userId) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const response: LoginResponse = {
              token: token,
              user: {
                user_id: userId,
                email: email,
                role: 'student',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(response);

            await authService.login({ email, password });

            const storedToken = sessionStorage.getItem('jwt_token');
            const storedUser = sessionStorage.getItem('user');

            // Both should exist or both should be null
            const bothExist = storedToken !== null && storedUser !== null;
            const bothNull = storedToken === null && storedUser === null;

            return bothExist || bothNull;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should store user email matching the response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          async (email, password) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const mockResponse: LoginResponse = {
              token: 'test-token',
              user: {
                user_id: '1',
                email: email,
                role: 'student',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            await authService.login({ email, password });

            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            return parsedUser && parsedUser.email === email;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Role-based login', () => {
    it('should correctly store user role for any valid role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          fc.constantFrom('student', 'provider', 'admin'),
          async (email, password, role) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const mockResponse: LoginResponse = {
              token: 'test-token',
              user: {
                user_id: '1',
                email: email,
                role: role as 'student' | 'provider' | 'admin',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            await authService.login({ email, password });

            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            return parsedUser && parsedUser.role === role;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Authentication state after login', () => {
    it('should be authenticated after successful login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8 }),
          async (email, password) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            const mockResponse: LoginResponse = {
              token: 'test-token',
              user: {
                user_id: '1',
                email: email,
                role: 'student',
                created_at: new Date().toISOString(),
              },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            await authService.login({ email, password });

            return authService.isAuthenticated() === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not be authenticated after failed login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 1 }),
          async (email, password) => {
            vi.clearAllMocks();
            sessionStorage.clear();

            vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

            try {
              await authService.login({ email, password });
              return false;
            } catch (error) {
              return authService.isAuthenticated() === false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Property 4: Logout clears authentication state (round-trip)', () => {
  it('should clear JWT token after logout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.string({ minLength: 20 }),
        async (email, password, token) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // First, login to establish auth state
          const mockResponse: LoginResponse = {
            token: token,
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify token is stored
          const tokenBeforeLogout = sessionStorage.getItem('jwt_token');
          if (tokenBeforeLogout !== token) return false;

          // Now logout
          authService.logout();

          // Verify token is cleared
          return sessionStorage.getItem('jwt_token') === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear user data after logout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        async (email, password) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login first
          const mockResponse: LoginResponse = {
            token: 'test-token',
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify user is stored
          const userBeforeLogout = sessionStorage.getItem('user');
          if (!userBeforeLogout) return false;

          // Logout
          authService.logout();

          // Verify user data is cleared
          return sessionStorage.getItem('user') === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not be authenticated after logout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        async (email, password) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login first
          const mockResponse: LoginResponse = {
            token: 'test-token',
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify authenticated
          if (!authService.isAuthenticated()) return false;

          // Logout
          authService.logout();

          // Verify not authenticated
          return authService.isAuthenticated() === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear both token and user data together (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.string({ minLength: 20 }),
        fc.uuid(),
        async (email, password, token, userId) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login
          const mockResponse: LoginResponse = {
            token: token,
            user: {
              user_id: userId,
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify both are stored
          const hasToken = sessionStorage.getItem('jwt_token') !== null;
          const hasUser = sessionStorage.getItem('user') !== null;
          if (!hasToken || !hasUser) return false;

          // Logout
          authService.logout();

          // Verify both are cleared
          const tokenCleared = sessionStorage.getItem('jwt_token') === null;
          const userCleared = sessionStorage.getItem('user') === null;

          return tokenCleared && userCleared;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 86: Authentication state persists to session storage (round-trip)', () => {
  it('should persist token to session storage and retrieve it', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.string({ minLength: 20 }),
        async (email, password, token) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login to store auth state
          const mockResponse: LoginResponse = {
            token: token,
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify token persists in session storage
          const storedToken = sessionStorage.getItem('jwt_token');
          if (storedToken !== token) return false;

          // Simulate app reload by retrieving token
          const retrievedToken = authService.getToken();

          return retrievedToken === token;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist user data to session storage and retrieve it', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.uuid(),
        fc.constantFrom('student', 'provider', 'admin'),
        async (email, password, userId, role) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login to store auth state
          const user = {
            user_id: userId,
            email: email,
            role: role as 'student' | 'provider' | 'admin',
            created_at: new Date().toISOString(),
          };

          const mockResponse: LoginResponse = {
            token: 'test-token',
            user: user,
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify user persists in session storage
          const storedUser = sessionStorage.getItem('user');
          if (!storedUser) return false;

          const parsedUser = JSON.parse(storedUser);

          // Simulate app reload by retrieving user
          const retrievedUser = await authService.getCurrentUser();

          return (
            retrievedUser !== null &&
            retrievedUser.user_id === userId &&
            retrievedUser.email === email &&
            retrievedUser.role === role
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain authentication state after simulated reload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.string({ minLength: 20 }),
        async (email, password, token) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login
          const mockResponse: LoginResponse = {
            token: token,
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify authenticated before "reload"
          if (!authService.isAuthenticated()) return false;

          // Simulate reload - session storage persists, but we check if isAuthenticated still works
          const stillAuthenticated = authService.isAuthenticated();

          return stillAuthenticated === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should restore complete auth state from session storage (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        fc.string({ minLength: 20 }),
        fc.uuid(),
        async (email, password, token, userId) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login to establish auth state
          const user = {
            user_id: userId,
            email: email,
            role: 'student' as const,
            created_at: new Date().toISOString(),
          };

          const mockResponse: LoginResponse = {
            token: token,
            user: user,
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Verify state is stored
          const storedToken = sessionStorage.getItem('jwt_token');
          const storedUser = sessionStorage.getItem('user');

          if (!storedToken || !storedUser) return false;

          // Simulate app reload - retrieve state from storage
          const retrievedToken = authService.getToken();
          const retrievedUser = await authService.getCurrentUser();
          const isAuth = authService.isAuthenticated();

          // Verify complete round-trip
          return (
            retrievedToken === token &&
            retrievedUser !== null &&
            retrievedUser.user_id === userId &&
            retrievedUser.email === email &&
            isAuth === true
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not restore auth state after logout (negative test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8 }),
        async (email, password) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          // Login
          const mockResponse: LoginResponse = {
            token: 'test-token',
            user: {
              user_id: '1',
              email: email,
              role: 'student',
              created_at: new Date().toISOString(),
            },
          };

          vi.mocked(api.post).mockResolvedValue(mockResponse);
          await authService.login({ email, password });

          // Logout to clear state
          authService.logout();

          // Verify state is not restored
          const token = authService.getToken();
          const user = await authService.getCurrentUser();
          const isAuth = authService.isAuthenticated();

          return token === null && user === null && isAuth === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
