import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import useToast from '../hooks/useToast';
import type { UserProfile } from '../types/profile';

// Mock dependencies
vi.mock('../contexts/AuthContext');
vi.mock('../services/profileService');
vi.mock('../hooks/useToast');
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));
vi.mock('../components/profile/ProfileForm', () => ({
  default: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="profile-form">
      <button onClick={onSuccess}>Profile Form Success</button>
    </div>
  ),
}));
vi.mock('../components/profile/PreferencesForm', () => ({
  default: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="preferences-form">
      <button onClick={onSuccess}>Preferences Form Success</button>
    </div>
  ),
}));
vi.mock('../components/profile/GoogleCalendarConnect', () => ({
  default: () => <div data-testid="google-calendar-connect" />,
}));

import { useSearchParams } from 'react-router-dom';

const mockUseAuth = useAuth as any;
const mockProfileService = profileService as any;
const mockUseToast = useToast as any;
const mockUseSearchParams = useSearchParams as any;

describe('ProfilePage', () => {
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

    // Default: no query params
    mockUseSearchParams.mockReturnValue([
      { get: () => null },
      vi.fn(),
    ]);

    mockProfileService.getProfile.mockResolvedValue(mockProfile);
    mockProfileService.updateProfile.mockResolvedValue(mockProfile);
  });

  describe('Rendering', () => {
    it('should display page header', () => {
      render(<ProfilePage />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Manage your account information and preferences.')).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      render(<ProfilePage />);

      expect(screen.getByRole('tab', { name: /Account Information/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Preferences & Notifications/i })).toBeInTheDocument();
    });

    it('should display ProfileForm by default', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to PreferencesForm when preferences tab is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });
      await user.click(preferencesTab);

      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-form')).not.toBeInTheDocument();
    });

    it('should switch back to ProfileForm when account tab is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      // Switch to preferences
      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });
      await user.click(preferencesTab);

      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();

      // Switch back to profile
      const accountTab = screen.getByRole('tab', { name: /Account Information/i });
      await user.click(accountTab);

      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
      expect(screen.queryByTestId('preferences-form')).not.toBeInTheDocument();
    });

    it('should highlight active tab', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const accountTab = screen.getByRole('tab', { name: /Account Information/i });
      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });

      // Account tab should be active initially
      expect(accountTab).toHaveClass('border-primary-600', 'text-primary-600');
      expect(preferencesTab).toHaveClass('border-transparent', 'text-gray-600');

      // Switch to preferences
      await user.click(preferencesTab);

      expect(preferencesTab).toHaveClass('border-primary-600', 'text-primary-600');
      expect(accountTab).toHaveClass('border-transparent', 'text-gray-600');
    });

    it('should set aria-selected attribute on active tab', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const accountTab = screen.getByRole('tab', { name: /Account Information/i });
      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });

      expect(accountTab).toHaveAttribute('aria-selected', 'true');
      expect(preferencesTab).toHaveAttribute('aria-selected', 'false');

      await user.click(preferencesTab);

      expect(accountTab).toHaveAttribute('aria-selected', 'false');
      expect(preferencesTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Form Integration', () => {
    it('should pass onSuccess callback to ProfileForm', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const profileFormButton = screen.getByText('Profile Form Success');
      expect(profileFormButton).toBeInTheDocument();

      // Clicking the button should not throw an error
      await user.click(profileFormButton);
    });

    it('should pass onSuccess callback to PreferencesForm', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });
      await user.click(preferencesTab);

      const preferencesFormButton = screen.getByText('Preferences Form Success');
      expect(preferencesFormButton).toBeInTheDocument();

      // Clicking the button should not throw an error
      await user.click(preferencesFormButton);
    });
  });

  describe('Layout Structure', () => {
    it('should have proper spacing between sections', () => {
      const { container } = render(<ProfilePage />);

      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should display tabs with proper styling', () => {
      const { container } = render(<ProfilePage />);

      const tabContainer = container.querySelector('.border-b.border-gray-200');
      expect(tabContainer).toBeInTheDocument();
    });

    it('should have proper tab button styling', () => {
      render(<ProfilePage />);

      const accountTab = screen.getByRole('tab', { name: /Account Information/i });
      expect(accountTab).toHaveClass('py-3', 'px-1', 'border-b-2', 'font-medium', 'text-sm');
    });
  });

  describe('Google Calendar Integration', () => {
    it('should render GoogleCalendarConnect component', () => {
      render(<ProfilePage />);
      expect(screen.getByTestId('google-calendar-connect')).toBeInTheDocument();
    });

    it('should show success toast when ?calendar=connected query param is present', async () => {
      const mockSetSearchParams = vi.fn();
      mockUseSearchParams.mockReturnValue([
        { get: (key: string) => (key === 'calendar' ? 'connected' : null) },
        mockSetSearchParams,
      ]);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Google Calendar connected successfully!',
          'success'
        );
      });
      expect(mockSetSearchParams).toHaveBeenCalledWith({}, { replace: true });
    });

    it('should not show toast when ?calendar param is absent', () => {
      render(<ProfilePage />);
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attributes on tabs', () => {
      render(<ProfilePage />);

      const accountTab = screen.getByRole('tab', { name: /Account Information/i });
      const preferencesTab = screen.getByRole('tab', { name: /Preferences & Notifications/i });

      expect(accountTab).toHaveAttribute('role', 'tab');
      expect(preferencesTab).toHaveAttribute('role', 'tab');
    });

    it('should have descriptive page heading', () => {
      render(<ProfilePage />);

      const heading = screen.getByText('Profile');
      expect(heading).toHaveClass('text-3xl', 'font-bold');
    });

    it('should have descriptive subtitle', () => {
      render(<ProfilePage />);

      expect(screen.getByText('Manage your account information and preferences.')).toBeInTheDocument();
    });
  });
});
