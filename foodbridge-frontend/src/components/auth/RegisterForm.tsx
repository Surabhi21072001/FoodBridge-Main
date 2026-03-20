import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../shared/Button';
import Input from '../shared/Input';
import type { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    first_name: '',
    last_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      // Extract confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to login page
      navigate('/login', {
        state: { message: 'Registration successful! Please log in with your credentials.' },
      });
    } catch (error) {
      // Handle different error types
      if (error instanceof Error) {
        const errorMessage = error.message || 'Registration failed. Please try again.';
        setGeneralError(errorMessage);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      {/* General error message */}
      {generalError && (
        <div
          className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
          role="alert"
        >
          {generalError}
        </div>
      )}

      {/* First and last name */}
      <div className="flex gap-3">
        <Input
          label="First Name"
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleInputChange}
          error={errors.first_name}
          placeholder="First name"
          required
          disabled={isLoading}
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleInputChange}
          error={errors.last_name}
          placeholder="Last name"
          required
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

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

      {/* Role selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-danger-600">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.role
              ? 'border-danger-300 bg-danger-50'
              : 'border-gray-300 bg-white'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="student">Student</option>
          <option value="provider">Provider</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-danger-600">{errors.role}</p>
        )}
      </div>

      {/* Password input */}
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        placeholder="Enter your password (min 8 characters)"
        required
        disabled={isLoading}
        autoComplete="new-password"
      />

      {/* Confirm password input */}
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
        disabled={isLoading}
        autoComplete="new-password"
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
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Log in
        </a>
      </p>
    </form>
  );
};

export default RegisterForm;
