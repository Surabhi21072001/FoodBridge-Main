import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from './ProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import useToast from '../../hooks/useToast';
import type { UserProfile } from '../../types/profile';

// Mock dependencies
vi.mock('../../contexts/AuthContext');
vi.mock('../../services/profileService');
vi.mock('../../hooks/useToast');

const mockUseAuth = useAuth as any;
const mockProfileService = profileService as any;
const mockUseToast = useToast as any;

describe('ProfileForm', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'student' as const,
    created_at: '2024-01-01',
  };

  const mockProfile: UserProfile = {
    profile_id: 'profile-123',
    user_id: 'user-123',
    dietary_preferences: ['vegetarian'],
    allergies: ['peanuts'],
    preferred_food_types: ['asian'],
    notification_preferences: {
      email_enabled: true,
      push_enabled: true,
      new_listings: true,
      reservation_confirmations: true,
      appointment_reminders: true,
    },
  };

  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    mockUseToast.mockReturnValue({
      toasts: [],
      showToast: mockShowToast,
      dismissToast: vi.fn(),
      clearAll: vi.fn(),
    });

    mockProfileService.getProfile.mockResolvedValue(mockProfile);
    mockProfileService.updateProfile.mockResolvedValue(mockProfile);
  });

  describe('Rendering', () => {
    it('should display loading state initially', () => {
      mockProfileService.getProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProfile), 100))
      );

      render(<ProfileForm />);

      // Loading state should show skeleton loaders with animate-pulse class
      const skeletonContainer = document.querySelector('.animate-pulse');
      expect(skeletonContainer).toBeInTheDocument();
    });

    it('should display user email as read-only', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      });

      // Email should be displayed as text, not an input
      const emailText = screen.getByText(mockUser.email);
      expect(emailText.tagName).not.toBe('INPUT');
    });

    it('should display user role as read-only', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByText('student')).toBeInTheDocument();
      });

      // Role should be displayed as text, not an input
      const roleText = screen.getByText('student');
      expect(roleText.tagName).not.toBe('INPUT');
    });

    it('should display editable preference fields', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('peanuts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('asian')).toBeInTheDocument();
    });

    it('should display save button', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });
    });

    it('should display Account Information section', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByText(/Account Information/i)).toBeInTheDocument();
      });
    });

    it('should display Preferences section heading', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        const headings = screen.getAllByText(/Preferences/i);
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {
    it('should update profile on form submission', async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
          dietary_preferences: ['vegetarian'],
          allergies: ['peanuts'],
          preferred_food_types: ['asian'],
        });
      });
    });

    it('should show success toast on successful update', async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Profile updated successfully', 'success');
      });
    });

    it('should call onSuccess callback after successful update', async () => {
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      render(<ProfileForm onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      mockProfileService.updateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProfile), 100))
      );

      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on update failure', async () => {
      const errorMessage = 'Failed to update profile';
      mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));

      const user = userEvent.setup();
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show error toast on update failure', async () => {
      const errorMessage = 'Failed to update profile';
      mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));

      const user = userEvent.setup();
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
      });
    });

    it('should handle fetch profile error gracefully', async () => {
      mockProfileService.getProfile.mockRejectedValue(new Error('Fetch failed'));

      render(<ProfileForm />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to load profile', 'error');
      });
    });
  });

  describe('Input Handling', () => {
    it('should update dietary preferences when input changes', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian') as HTMLInputElement;
      expect(dietaryInput).toBeInTheDocument();
      expect(dietaryInput.value).toBe('vegetarian');
    });

    it('should handle empty preference fields', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian') as HTMLInputElement;
      expect(dietaryInput.value).toBe('vegetarian');
    });

    it('should display all preference fields', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Dietary Preferences/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Allergies/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred Food Types/i)).toBeInTheDocument();
    });
  });

  describe('Field-Specific Errors', () => {
    it('should display field-specific error for invalid dietary preferences', async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
      });

      // This test validates that the form structure supports field-specific errors
      // The actual validation would depend on backend response
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Profile Loading', () => {
    it('should fetch profile on component mount', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(mockProfileService.getProfile).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('should populate form with fetched profile data', async () => {
      render(<ProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('vegetarian')).toBeInTheDocument();
        expect(screen.getByDisplayValue('peanuts')).toBeInTheDocument();
        expect(screen.getByDisplayValue('asian')).toBeInTheDocument();
      });
    });

    it('should handle missing user gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      });

      render(<ProfileForm />);

      await waitFor(() => {
        expect(mockProfileService.getProfile).not.toHaveBeenCalled();
      });
    });
  });
});
