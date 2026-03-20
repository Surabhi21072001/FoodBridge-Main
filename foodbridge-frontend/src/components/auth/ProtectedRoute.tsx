import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'provider' | 'admin';
}

/**
 * ProtectedRoute component that enforces authentication and optional role-based access control.
 *
 * - Checks authentication state from AuthContext
 * - Redirects to login if not authenticated
 * - Optionally checks user role if requiredRole is specified
 * - Shows loading spinner while auth state is being restored
 *
 * @param children - The component to render if authorized
 * @param requiredRole - Optional role requirement for access
 */
export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while auth state is being restored
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access control if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authorized
  return <>{children}</>;
};
