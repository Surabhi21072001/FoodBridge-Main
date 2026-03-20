import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from session storage on app load
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Set a timeout for getCurrentUser to prevent hanging
          const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 5000); // 5 second timeout
          });
          
          const userPromise = authService.getCurrentUser();
          const user = await Promise.race([userPromise, timeoutPromise]);
          
          if (user) {
            setToken(token);
            setUser(user);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuthState();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      // Clear state on login failure
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await authService.register(data);
      // Registration successful, user will need to log in
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!(token && user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
