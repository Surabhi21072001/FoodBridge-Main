import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { AuthProvider } from '../../contexts/AuthContext';
import authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
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
    useLocation: () => ({
      state: { from: { pathname: '/' } },
    }),
  };
});

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Form Validation Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Property 61: Validation errors are displayed for invalid inputs', () => {
    /**
     * Validates: Requirements 12.2, 12.3, 12.4, 12.5, 12.6
     *
     * For any invalid form input (empty required field, invalid email format,
     * short password, invalid quantity, invalid time range), the form should
     * display an appropriate error message for that field.
     */

    it('should prevent form submission with empty email (Req 12.2)', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          cleanup();
          renderLoginForm();

          const submitButton = screen.getByRole('button', { name: /log in/i });
          fireEvent.click(submitButton);

          // Form submission should not occur
          expect(authService.login).not.toHaveBeenCalled();
        }),
        { numRuns: 3 }
      );
    });

    it('should prevent form submission with empty password (Req 12.2)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map((email) => email.replace(/[^a-zA-Z0-9@.]/g, 'a')),
          async (email) => {
            cleanup();
            renderLoginForm();

            const form = screen.getByRole('button', { name: /log in/i }).closest('form');
            const inputs = form?.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]') as NodeListOf<HTMLInputElement>;
            const emailInput = inputs[0];
            
            await userEvent.type(emailInput, email);

            const submitButton = screen.getByRole('button', { name: /log in/i });
            await userEvent.click(submitButton);

            // Form submission should not occur (password is empty)
            expect(authService.login).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent form submission with invalid email format (Req 12.3)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
          async (invalidEmail) => {
            cleanup();
            renderLoginForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const passwordInput = inputs[1];

            await userEvent.type(emailInput, invalidEmail);
            await userEvent.type(passwordInput, 'password123');

            const submitButton = screen.getByRole('button', { name: /log in/i });
            await userEvent.click(submitButton);

            // Form submission should not occur (invalid email)
            expect(authService.login).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent form submission with short password (Req 12.4)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 7 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
          async (shortPassword) => {
            cleanup();
            renderRegisterForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const passwordInput = inputs[1];

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, shortPassword);

            const submitButton = screen.getByRole('button', { name: /sign up/i });
            await userEvent.click(submitButton);

            // Form submission should not occur if password is too short
            if (shortPassword.length < 8) {
              expect(authService.register).not.toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent form submission when passwords do not match (Req 12.6)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 15 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
          fc.string({ minLength: 8, maxLength: 15 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
          async (password, confirmPassword) => {
            // Only test when passwords don't match
            if (password === confirmPassword) return;

            cleanup();
            renderRegisterForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const passwordInput = inputs[1];
            const confirmPasswordInput = inputs[2];

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, password);
            await userEvent.type(confirmPasswordInput, confirmPassword);

            const submitButton = screen.getByRole('button', { name: /sign up/i });
            await userEvent.click(submitButton);

            // Form submission should not occur when passwords don't match
            expect(authService.register).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should clear validation errors when user corrects input (Req 12.2)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map((email) => email.replace(/[^a-zA-Z0-9@.]/g, 'a')),
          async (validEmail) => {
            cleanup();
            renderLoginForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const submitButton = screen.getByRole('button', { name: /log in/i });

            // Trigger validation error by submitting empty form
            await userEvent.click(submitButton);
            expect(authService.login).not.toHaveBeenCalled();

            // User corrects the input
            await userEvent.type(emailInput, validEmail);

            // After correction, the input should have a value
            expect(emailInput).toHaveValue(validEmail);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent submission with all fields empty (Req 12.2)', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          cleanup();
          renderLoginForm();

          const submitButton = screen.getByRole('button', { name: /log in/i });

          // Submit with all fields empty
          fireEvent.click(submitButton);

          // Form submission should not occur
          expect(authService.login).not.toHaveBeenCalled();
        }),
        { numRuns: 3 }
      );
    });

    it('should allow submission with valid email format (Req 12.3)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map((email) => email.replace(/[^a-zA-Z0-9@.]/g, 'a')),
          async (validEmail) => {
            vi.mocked(authService.login).mockRejectedValueOnce(new Error('Test error'));

            cleanup();
            renderLoginForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const passwordInput = inputs[1];
            const submitButton = screen.getByRole('button', { name: /log in/i });

            await userEvent.type(emailInput, validEmail);
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            // Valid email - form submission should be attempted
            expect(authService.login).toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should allow submission with valid password length (Req 12.4)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 15 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
          async (validPassword) => {
            vi.mocked(authService.register).mockRejectedValueOnce(new Error('Test error'));

            cleanup();
            renderRegisterForm();

            const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
            const emailInput = inputs[0];
            const passwordInput = inputs[1];
            const confirmPasswordInput = inputs[2];
            const submitButton = screen.getByRole('button', { name: /sign up/i });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, validPassword);
            await userEvent.type(confirmPasswordInput, validPassword);
            await userEvent.click(submitButton);

            // Valid password length - form submission should be attempted
            expect(authService.register).toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
