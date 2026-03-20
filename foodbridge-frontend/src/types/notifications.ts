/**
 * Notification type definitions
 */

export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
