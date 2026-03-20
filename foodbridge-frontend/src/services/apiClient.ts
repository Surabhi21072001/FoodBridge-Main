import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get JWT token from session storage, fall back to localStorage
    const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    
    // If token exists, add it to Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors and 401 redirects
apiClient.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    // Only redirect if we're in a protected area, not on public/auth pages
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/landing', '/'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some((p) =>
        p === '/' ? currentPath === '/' : currentPath.startsWith(p)
      );

      if (!isPublicPath) {
        sessionStorage.removeItem('jwt_token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Return error with response details
    return Promise.reject(error);
  }
);

export default apiClient;
