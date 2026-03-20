import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../shared/Button';
import Input from '../shared/Input';
import type { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        // Navigate to dashboard or intended page
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }, 100);
    } catch (error) {
      // Handle different error types
      if (error instanceof Error) {
        const errorMessage = error.message || 'Login failed. Please try again.';
        setGeneralError(errorMessage);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md mx-auto space-y-4">
      {/* General error message */}
      {generalError && (
        <div
          className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
          role="alert"
        >
          {generalError}
        </div>
      )}

      {/* Email input */}
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        placeholder="Enter your email"
        required
        disabled={isLoading}
        autoComplete="email"
      />

      {/* Password input */}
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        placeholder="Enter your password"
        required
        disabled={isLoading}
        autoComplete="current-password"
      />

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>

      {/* Registration link */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a
          href="/register"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign up
        </a>
      </p>
    </form>
  );
};

export default LoginForm;
