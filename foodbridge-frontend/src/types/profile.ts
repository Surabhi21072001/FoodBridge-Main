/**
 * Profile and Preferences Types
 */

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  new_listings: boolean;
  reservation_confirmations: boolean;
  appointment_reminders: boolean;
}

export interface UserProfile {
  profile_id: string;
  user_id: string;
  dietary_preferences: string[];
  allergies: string[];
  preferred_food_types: string[];
  notification_preferences: NotificationPreferences;
}

export interface UpdateProfileData {
  dietary_preferences?: string[];
  allergies?: string[];
  preferred_food_types?: string[];
  notification_preferences?: NotificationPreferences;
}

export interface Preferences {
  dietary_preferences?: string[];
  allergies?: string[];
  preferred_food_types?: string[];
  notification_preferences?: NotificationPreferences;
}
