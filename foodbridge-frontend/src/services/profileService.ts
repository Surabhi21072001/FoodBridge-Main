import api from './api';
import type { UserProfile, UpdateProfileData, Preferences } from '../types/profile';

/**
 * Profile Service
 * Handles user profile and preferences operations
 */
class ProfileService {
  /**
   * Get user profile
   * Fetches current user profile data from the backend API
   */
  async getProfile(_userId: string): Promise<UserProfile> {
    try {
      const response = await api.get<any>(`/users/profile`);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * Sends profile updates to the backend API
   * Supports updating dietary preferences, allergies, preferred food types, and notification preferences
   */
  async updateProfile(_userId: string, data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await api.put<any>(`/users/profile`, data);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user preferences
   * Sends preference updates to the backend API
   * Supports updating dietary preferences, allergies, preferred food types, and notification preferences
   */
  async updatePreferences(_userId: string, preferences: Preferences): Promise<void> {
    try {
      await api.patch(`/users/profile`, preferences);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
