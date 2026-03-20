import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreferencesForm from './PreferencesForm';
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

describe('PreferencesForm', () => {
  const mockUser = {
    user_id: 'user-123',
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
      push_enabled: false,
      new_listings: true,
      reservation_confirmations: true,
      appointment_reminders: false,
    },
  };

  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });
    mockUseToast.mockReturnValue({ showToast: mockShowToast });
    mockProfileService.getProfile.mockResolvedValue(mockProfile);
  });

  describe('Rendering', () => {
    it('should display loading skeleton while fetching profile', () => {
      mockProfileService.getProfile.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<PreferencesForm />);

      // Check for the skeleton loader div with animate-pulse class
      const skeletonDiv = container.querySelector('.animate-pulse');
      expect(skeletonDiv).toBeInTheDocument();
    });

    it('should display all form sections after loading', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByText('Food Preferences')).toBeInTheDocument();
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });
    });

    it('should display dietary preferences input', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        const input = screen.getByDisplayValue('vegetarian');
        expect(input).toBeInTheDocument();
      });
    });

    it('should display allergies input', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        const input = screen.getByDisplayValue('peanuts');
        expect(input).toBeInTheDocument();
      });
    });

    it('should display preferred food types input', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        const input = screen.getByDisplayValue('asian');
        expect(input).toBeInTheDocument();
      });
    });

    it('should display notification preference checkboxes', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument();
        expect(screen.getByLabelText('Push Notifications')).toBeInTheDocument();
        expect(screen.getByLabelText('New food listings matching my preferences')).toBeInTheDocument();
        expect(screen.getByLabelText('Reservation confirmations and updates')).toBeInTheDocument();
        expect(screen.getByLabelText('Pantry appointment reminders')).toBeInTheDocument();
      });
    });

    it('should pre-fill notification preferences from profile', async () => {
      render(<PreferencesForm />);

      await waitFor(() => {
        const emailCheckbox = screen.getByLabelText('Email Notifications') as HTMLInputElement;
        const pushCheckbox = screen.getByLabelText('Push Notifications') as HTMLInputElement;
        const newListingsCheckbox = screen.getByLabelText('New food listings matching my preferences') as HTMLInputElement;

        expect(emailCheckbox.checked).toBe(true);
        expect(pushCheckbox.checked).toBe(false);
        expect(newListingsCheckbox.checked).toBe(true);
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with updated preferences', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian') as HTMLInputElement;
      await user.clear(dietaryInput);
      await user.type(dietaryInput, 'vegan');

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-123', expect.any(Object));
        const callArgs = mockProfileService.updateProfile.mock.calls[0][1];
        expect(callArgs.dietary_preferences).toEqual(['vegan']);
      });
    });

    it('should show success toast on successful submission', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Preferences updated successfully', 'success');
      });
    });

    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<PreferencesForm onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      mockProfileService.updateProfile.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to update preferences';
      mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));

      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
      });
    });
  });

  describe('Input Handling', () => {
    it('should parse comma-separated dietary preferences', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian') as HTMLInputElement;
      await user.clear(dietaryInput);
      await user.type(dietaryInput, 'vegan');

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalled();
        const callArgs = mockProfileService.updateProfile.mock.calls[0][1];
        expect(Array.isArray(callArgs.dietary_preferences)).toBe(true);
      });
    });

    it('should handle notification preference checkbox changes', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Push Notifications')).toBeInTheDocument();
      });

      const pushCheckbox = screen.getByLabelText('Push Notifications') as HTMLInputElement;
      expect(pushCheckbox.checked).toBe(false);

      await user.click(pushCheckbox);

      expect(pushCheckbox.checked).toBe(true);

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({
          notification_preferences: expect.objectContaining({
            push_enabled: true,
          }),
        }));
      });
    });

    it('should trim whitespace from comma-separated values', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Allergies')).toBeInTheDocument();
      });

      const allergiesInput = screen.getByDisplayValue('peanuts') as HTMLInputElement;
      await user.clear(allergiesInput);
      await user.type(allergiesInput, 'peanuts');

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalled();
        const callArgs = mockProfileService.updateProfile.mock.calls[0][1];
        expect(Array.isArray(callArgs.allergies)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when profile fetch fails', async () => {
      mockProfileService.getProfile.mockRejectedValue(new Error('Network error'));

      render(<PreferencesForm />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to load preferences', 'error');
      });
    });

    it('should handle missing user gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      render(<PreferencesForm />);

      // When user is null, the component should not fetch profile
      await waitFor(() => {
        expect(mockProfileService.getProfile).not.toHaveBeenCalled();
      });
    });

    it('should show error when user ID is missing during submission', async () => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, user_id: '' },
        token: 'test-token',
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('User information not available')).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should validate dietary preferences as array', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian');
      await user.clear(dietaryInput);
      await user.type(dietaryInput, 'vegan');

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalled();
      });
    });

    it('should handle empty preference fields', async () => {
      const user = userEvent.setup();
      render(<PreferencesForm />);

      await waitFor(() => {
        expect(screen.getByLabelText('Dietary Preferences')).toBeInTheDocument();
      });

      const dietaryInput = screen.getByDisplayValue('vegetarian');
      await user.clear(dietaryInput);

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({
          dietary_preferences: [],
        }));
      });
    });
  });
});
