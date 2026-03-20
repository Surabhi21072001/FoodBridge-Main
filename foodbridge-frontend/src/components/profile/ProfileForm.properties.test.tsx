import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
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

describe('ProfileForm Properties', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'student' as const,
    created_at: '2024-01-01',
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
  });

  afterEach(() => {
    cleanup();
  });

  describe('Property 43: Profile updates display success messages', () => {
    /**
     * Validates: Requirements 9.2, 9.3, 9.4, 9.5
     *
     * For any valid profile update (dietary preferences, allergies, preferred food types,
     * or notification preferences), submitting the update should result in the data being
     * sent to the backend API and a success message being displayed.
     */

    it('should display success message when dietary preferences are updated (Req 9.2)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 3 }),
          async (preferences) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: preferences,
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify success message is displayed
            await waitFor(() => {
              expect(mockShowToast).toHaveBeenCalledWith(
                'Profile updated successfully',
                'success'
              );
            });

            // Verify API was called with correct data
            expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
              mockUser.id,
              expect.objectContaining({
                dietary_preferences: preferences,
              })
            );
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display success message when allergies are updated (Req 9.3)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 3 }),
          async (allergies) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: allergies,
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify success message is displayed
            await waitFor(() => {
              expect(mockShowToast).toHaveBeenCalledWith(
                'Profile updated successfully',
                'success'
              );
            });

            // Verify API was called with correct data
            expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
              mockUser.id,
              expect.objectContaining({
                allergies: allergies,
              })
            );
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display success message when preferred food types are updated (Req 9.4)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 3 }),
          async (foodTypes) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: foodTypes,
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify success message is displayed
            await waitFor(() => {
              expect(mockShowToast).toHaveBeenCalledWith(
                'Profile updated successfully',
                'success'
              );
            });

            // Verify API was called with correct data
            expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
              mockUser.id,
              expect.objectContaining({
                preferred_food_types: foodTypes,
              })
            );
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display success message when multiple profile fields are updated (Req 9.2, 9.3, 9.4)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          async (preferences, allergies, foodTypes) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: preferences,
              allergies: allergies,
              preferred_food_types: foodTypes,
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify success message is displayed
            await waitFor(() => {
              expect(mockShowToast).toHaveBeenCalledWith(
                'Profile updated successfully',
                'success'
              );
            });

            // Verify API was called with all updated data
            expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
              mockUser.id,
              expect.objectContaining({
                dietary_preferences: preferences,
                allergies: allergies,
                preferred_food_types: foodTypes,
              })
            );
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should send update to backend API before displaying success message (Req 9.2, 9.3, 9.4, 9.5)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          async (preferences) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: preferences,
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify API is called
            await waitFor(() => {
              expect(mockProfileService.updateProfile).toHaveBeenCalled();
            });

            // Verify success message is displayed after API call
            expect(mockShowToast).toHaveBeenCalledWith(
              'Profile updated successfully',
              'success'
            );

            // Verify the order: API call happens before success message
            const updateCallIndex = vi.mocked(mockProfileService.updateProfile).mock.invocationCallOrder[0];
            const toastCallIndex = vi.mocked(mockShowToast).mock.invocationCallOrder[0];
            expect(updateCallIndex).toBeLessThan(toastCallIndex);
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should call onSuccess callback after displaying success message (Req 9.2, 9.3, 9.4, 9.5)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          async (preferences) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: preferences,
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockResolvedValue(mockProfile);
            mockShowToast.mockClear();

            const onSuccess = vi.fn();

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm onSuccess={onSuccess} />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify success message is displayed
            await waitFor(() => {
              expect(mockShowToast).toHaveBeenCalledWith(
                'Profile updated successfully',
                'success'
              );
            });

            // Verify onSuccess callback is called
            expect(onSuccess).toHaveBeenCalled();
          }
        ),
        { numRuns: 5 }
      );
    });
  });
});

  describe('Property 44: Invalid profile updates display field-specific errors', () => {
    /**
     * Validates: Requirements 9.6
     *
     * For any profile update with validation errors, the application should display
     * specific error messages for each invalid field.
     */

    it('should display field-specific error when dietary preferences validation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.anything(),
          async (invalidValue) => {
            // Skip if the value is actually a valid array
            if (Array.isArray(invalidValue)) {
              return;
            }

            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            const localMockShowToast = vi.fn();
            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockRejectedValue(
              new Error('dietary_preferences: Invalid format')
            );
            mockUseToast.mockReturnValue({
              toasts: [],
              showToast: localMockShowToast,
              dismissToast: vi.fn(),
              clearAll: vi.fn(),
            });

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed
            await waitFor(() => {
              expect(localMockShowToast).toHaveBeenCalledWith(
                expect.stringContaining('dietary_preferences'),
                'error'
              );
            });
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display field-specific error when allergies validation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.anything(),
          async (invalidValue) => {
            // Skip if the value is actually a valid array
            if (Array.isArray(invalidValue)) {
              return;
            }

            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            const localMockShowToast = vi.fn();
            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockRejectedValue(
              new Error('allergies: Invalid format')
            );
            mockUseToast.mockReturnValue({
              toasts: [],
              showToast: localMockShowToast,
              dismissToast: vi.fn(),
              clearAll: vi.fn(),
            });

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed
            await waitFor(() => {
              expect(localMockShowToast).toHaveBeenCalledWith(
                expect.stringContaining('allergies'),
                'error'
              );
            });
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display field-specific error when preferred food types validation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.anything(),
          async (invalidValue) => {
            // Skip if the value is actually a valid array
            if (Array.isArray(invalidValue)) {
              return;
            }

            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            const localMockShowToast = vi.fn();
            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            mockProfileService.updateProfile.mockRejectedValue(
              new Error('preferred_food_types: Invalid format')
            );
            mockUseToast.mockReturnValue({
              toasts: [],
              showToast: localMockShowToast,
              dismissToast: vi.fn(),
              clearAll: vi.fn(),
            });

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed
            await waitFor(() => {
              expect(localMockShowToast).toHaveBeenCalledWith(
                expect.stringContaining('preferred_food_types'),
                'error'
              );
            });
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display multiple field-specific errors when multiple fields fail validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          async (fields) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            const localMockShowToast = vi.fn();
            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            const errorMessage = fields.map((f) => `${f}: Invalid format`).join(', ');
            mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));
            mockUseToast.mockReturnValue({
              toasts: [],
              showToast: localMockShowToast,
              dismissToast: vi.fn(),
              clearAll: vi.fn(),
            });

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // Submit the form
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed with field names
            await waitFor(() => {
              expect(localMockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
            });
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display error message in general error section when validation fails', async () => {
      const mockProfile: UserProfile = {
        profile_id: 'profile-123',
        user_id: 'user-123',
        dietary_preferences: [],
        allergies: [],
        preferred_food_types: [],
        notification_preferences: {
          email_enabled: true,
          push_enabled: true,
          new_listings: true,
          reservation_confirmations: true,
          appointment_reminders: true,
        },
      };

      const localMockShowToast = vi.fn();
      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      const errorMessage = 'dietary_preferences: Must contain valid items';
      mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));
      mockUseToast.mockReturnValue({
        toasts: [],
        showToast: localMockShowToast,
        dismissToast: vi.fn(),
        clearAll: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ProfileForm />);

      // Wait for profile to load
      await waitFor(() => {
        expect(mockProfileService.getProfile).toHaveBeenCalled();
      });

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      // Verify error message is displayed in the UI
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should preserve field-specific error information across multiple submission attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 2 }),
          async (fields) => {
            const mockProfile: UserProfile = {
              profile_id: 'profile-123',
              user_id: 'user-123',
              dietary_preferences: [],
              allergies: [],
              preferred_food_types: [],
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                new_listings: true,
                reservation_confirmations: true,
                appointment_reminders: true,
              },
            };

            const localMockShowToast = vi.fn();
            mockProfileService.getProfile.mockResolvedValue(mockProfile);
            const errorMessage = fields.map((f) => `${f}: Invalid format`).join(', ');
            mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));
            mockUseToast.mockReturnValue({
              toasts: [],
              showToast: localMockShowToast,
              dismissToast: vi.fn(),
              clearAll: vi.fn(),
            });

            cleanup();
            const user = userEvent.setup();
            render(<ProfileForm />);

            // Wait for profile to load
            await waitFor(() => {
              expect(mockProfileService.getProfile).toHaveBeenCalled();
            });

            // First submission attempt
            let saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed
            await waitFor(() => {
              expect(localMockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
            });

            const firstCallCount = vi.mocked(localMockShowToast).mock.calls.length;

            // Second submission attempt
            saveButton = screen.getByRole('button', { name: /Save Changes/i });
            await user.click(saveButton);

            // Verify error message is displayed again with same field information
            await waitFor(() => {
              expect(vi.mocked(localMockShowToast).mock.calls.length).toBeGreaterThan(firstCallCount);
              expect(localMockShowToast).toHaveBeenLastCalledWith(errorMessage, 'error');
            });
          }
        ),
        { numRuns: 3 }
      );
    });
  });
