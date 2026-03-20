// Authentication types

export interface User {
  id: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'student' | 'provider';
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
