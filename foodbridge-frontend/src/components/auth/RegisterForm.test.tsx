import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { AuthProvider } from '../../contexts/AuthContext';
import authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render RegisterForm with required providers
const renderRegisterForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterForm {...props} />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderRegisterForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderRegisterForm();

      const loginLink = screen.getByRole('link', { name: /log in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have role dropdown with student and provider options', () => {
      renderRegisterForm();

      const roleSelect = screen.getByLabelText(/^role/i) as HTMLSelectElement;
      expect(roleSelect).toBeInTheDocument();
      expect(roleSelect.value).toBe('student'); // Default value

      const options = roleSelect.querySelectorAll('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('student');
      expect(options[1]).toHaveValue('provider');
    });
  });

  describe('Form Validation', () => {
    it('should not submit form with empty email', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(authService.register)).not.toHaveBeenCalled();
      });
    });

    it('should not submit form with invalid email', async () => {
      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(authService.register)).not.toHaveBeenCalled();
      });
    });

    it('should not submit form with short password', async () => {
      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'short');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(authService.register)).not.toHaveBeenCalled();
      });
    });

    it('should not submit form when passwords do not match', async () => {
      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'differentpassword123');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(authService.register)).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call register with correct data on valid submission', async () => {
      vi.mocked(authService.register).mockResolvedValue(undefined);

      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const roleSelect = screen.getByLabelText(/^role/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.selectOptions(roleSelect, 'provider');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'validpassword123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(authService.register)).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'validpassword123',
          role: 'provider',
        });
      });
    });

    it('should display loading state during submission', async () => {
      vi.mocked(authService.register).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'validpassword123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
      });
    });

    it('should disable form fields during submission', async () => {
      vi.mocked(authService.register).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const roleSelect = screen.getByLabelText(/^role/i) as HTMLSelectElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'validpassword123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);
        expect(confirmPasswordInput.disabled).toBe(true);
        expect(roleSelect.disabled).toBe(true);
        expect(submitButton.disabled).toBe(true);
      });
    });

    it('should display error message on registration failure', async () => {
      const errorMessage = 'Email already exists';
      vi.mocked(authService.register).mockRejectedValue(new Error(errorMessage));

      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'validpassword123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should call onSuccess callback after successful registration', async () => {
      vi.mocked(authService.register).mockResolvedValue(undefined);
      const onSuccess = vi.fn();

      renderRegisterForm({ onSuccess });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'validpassword123');
      await userEvent.type(confirmPasswordInput, 'validpassword123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderRegisterForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should mark required fields', () => {
      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });
});
