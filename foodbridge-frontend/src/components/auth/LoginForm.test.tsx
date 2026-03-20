import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { from: { pathname: '/' } },
    }),
  };
});

const renderLoginForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  describe('Rendering', () => {
    it('should render email and password inputs', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderLoginForm();

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should render registration link', () => {
      renderLoginForm();

      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should have correct input types', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      expect(emailInput.type).toBe('email');
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Validation', () => {
    it('should display error when email is empty', async () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);

      const errorMessage = await screen.findByText(/email is required/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should display error when password is empty', async () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);

      const errorMessage = await screen.findByText(/password is required/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should display error for invalid email format', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.click(submitButton);

      const errorMessage = await screen.findByText(/please enter a valid email address/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should clear error when user starts typing', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      // Trigger validation error
      fireEvent.click(submitButton);

      const errorMessage = await screen.findByText(/email is required/i);
      expect(errorMessage).toBeInTheDocument();

      // Start typing
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should not submit form with invalid data', async () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.login).not.toHaveBeenCalled();
      });
    });

    it('should disable inputs and button during submission', async () => {
      const mockUser = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student' as const,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ token: 'test-token', user: mockUser }), 100))
      );
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /log in/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);
        expect(submitButton.disabled).toBe(true);
      });
    });

    it('should display loading state on button', async () => {
      const mockUser = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student' as const,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ token: 'test-token', user: mockUser }), 100))
      );
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/logging in/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage));

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error message for unknown errors', async () => {
      vi.mocked(authService.login).mockRejectedValueOnce('Unknown error');

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });

    it('should clear general error when user submits again', async () => {
      vi.mocked(authService.login)
        .mockRejectedValueOnce(new Error('Login failed'))
        .mockResolvedValueOnce(undefined);

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      // First submission - fails
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      // Second submission - should clear error
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error messages', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.click(submitButton);

      // Wait for error message to appear
      await screen.findByText(/email is required/i);

      // Now check aria-invalid
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper labels for inputs', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have required attribute on inputs', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      expect(emailInput.required).toBe(true);
      expect(passwordInput.required).toBe(true);
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback after successful login', async () => {
      const onSuccess = vi.fn();
      const mockUser = {
        user_id: '1',
        email: 'test@example.com',
        role: 'student' as const,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.login).mockResolvedValueOnce({ token: 'test-token', user: mockUser });
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      renderLoginForm({ onSuccess });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});
