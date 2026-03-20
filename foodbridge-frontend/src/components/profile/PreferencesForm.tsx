import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import Button from '../shared/Button';
import Input from '../shared/Input';
import useToast from '../../hooks/useToast';
import type { NotificationPreferences } from '../../types/profile';

interface PreferencesFormProps {
  onSuccess?: () => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    dietary_preferences: [] as string[],
    allergies: [] as string[],
    preferred_food_types: [] as string[],
    notification_preferences: {
      email_enabled: false,
      push_enabled: false,
      new_listings: false,
      reservation_confirmations: false,
      appointment_reminders: false,
    } as NotificationPreferences,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsFetching(false);
        return;
      }

      try {
        const userProfile = await profileService.getProfile(user.id);
        setFormData({
          dietary_preferences: userProfile.dietary_preferences || [],
          allergies: userProfile.allergies || [],
          preferred_food_types: userProfile.preferred_food_types || [],
          notification_preferences: userProfile.notification_preferences || {
            email_enabled: false,
            push_enabled: false,
            new_listings: false,
            reservation_confirmations: false,
            appointment_reminders: false,
          },
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        showToast('Failed to load preferences', 'error');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [user?.id, showToast]);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate dietary preferences (optional but if provided, must be array)
    if (formData.dietary_preferences && !Array.isArray(formData.dietary_preferences)) {
      newErrors.dietary_preferences = 'Dietary preferences must be a list';
    }

    // Validate allergies (optional but if provided, must be array)
    if (formData.allergies && !Array.isArray(formData.allergies)) {
      newErrors.allergies = 'Allergies must be a list';
    }

    // Validate preferred food types (optional but if provided, must be array)
    if (formData.preferred_food_types && !Array.isArray(formData.preferred_food_types)) {
      newErrors.preferred_food_types = 'Preferred food types must be a list';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Parse comma-separated values into arrays
    const arrayValue = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setFormData((prev) => ({
      ...prev,
      [name]: arrayValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle notification preference checkbox change
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [name]: checked,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setGeneralError('User information not available');
      return;
    }

    setIsLoading(true);

    try {
      await profileService.updateProfile(user.id, {
        dietary_preferences: formData.dietary_preferences,
        allergies: formData.allergies,
        preferred_food_types: formData.preferred_food_types,
        notification_preferences: formData.notification_preferences,
      });
      showToast('Preferences updated successfully', 'success');

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Handle different error types
      if (error instanceof Error) {
        const errorMessage = error.message || 'Failed to update preferences. Please try again.';
        setGeneralError(errorMessage);
        showToast(errorMessage, 'error');
      } else {
        const errorMessage = 'An unexpected error occurred. Please try again.';
        setGeneralError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="w-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-6">
      {/* Submit button at top */}
      <div className="flex gap-3 pb-4 border-b border-gray-200">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* General error message */}
      {generalError && (
        <div
          className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
          role="alert"
        >
          {generalError}
        </div>
      )}

      {/* Food Preferences Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Preferences</h3>

        {/* Dietary preferences */}
        <div className="mb-4">
          <Input
            label="Dietary Preferences"
            type="text"
            name="dietary_preferences"
            value={formData.dietary_preferences?.join(', ') || ''}
            onChange={handleInputChange}
            error={errors.dietary_preferences}
            placeholder="Enter dietary preferences (comma-separated, e.g., vegetarian, vegan, gluten-free)"
            disabled={isLoading}
            helperText="Enter multiple preferences separated by commas"
          />
        </div>

        {/* Allergies */}
        <div className="mb-4">
          <Input
            label="Allergies"
            type="text"
            name="allergies"
            value={formData.allergies?.join(', ') || ''}
            onChange={handleInputChange}
            error={errors.allergies}
            placeholder="Enter allergies (comma-separated, e.g., peanuts, shellfish, dairy)"
            disabled={isLoading}
            helperText="Enter multiple allergies separated by commas"
          />
        </div>

        {/* Preferred food types */}
        <div>
          <Input
            label="Preferred Food Types"
            type="text"
            name="preferred_food_types"
            value={formData.preferred_food_types?.join(', ') || ''}
            onChange={handleInputChange}
            error={errors.preferred_food_types}
            placeholder="Enter preferred food types (comma-separated, e.g., asian, italian, mexican)"
            disabled={isLoading}
            helperText="Enter multiple food types separated by commas"
          />
        </div>
      </div>

      {/* Notification Preferences Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>

        {/* General notification settings */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_enabled"
              name="email_enabled"
              checked={formData.notification_preferences.email_enabled}
              onChange={handleNotificationChange}
              disabled={isLoading}
              className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="email_enabled" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
              Email Notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="push_enabled"
              name="push_enabled"
              checked={formData.notification_preferences.push_enabled}
              onChange={handleNotificationChange}
              disabled={isLoading}
              className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="push_enabled" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
              Push Notifications
            </label>
          </div>
        </div>

        {/* Specific notification types */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Notify me about:</p>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_listings"
                name="new_listings"
                checked={formData.notification_preferences.new_listings}
                onChange={handleNotificationChange}
                disabled={isLoading}
                className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="new_listings" className="ml-3 text-sm text-gray-700 cursor-pointer">
                New food listings matching my preferences
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="reservation_confirmations"
                name="reservation_confirmations"
                checked={formData.notification_preferences.reservation_confirmations}
                onChange={handleNotificationChange}
                disabled={isLoading}
                className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="reservation_confirmations" className="ml-3 text-sm text-gray-700 cursor-pointer">
                Reservation confirmations and updates
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="appointment_reminders"
                name="appointment_reminders"
                checked={formData.notification_preferences.appointment_reminders}
                onChange={handleNotificationChange}
                disabled={isLoading}
                className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="appointment_reminders" className="ml-3 text-sm text-gray-700 cursor-pointer">
                Pantry appointment reminders
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PreferencesForm;
