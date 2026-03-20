/**
 * Pantry inventory item type
 */
export interface PantryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  dietary_tags?: string[];
  allergen_info?: string[];
  expiration_date?: string;
  location?: string;
  reorder_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Available time slot for pantry appointments
 */
export interface TimeSlot {
  slot_id: string;
  slot_time: string;
  is_booked: boolean;
}

/**
 * Pantry appointment type
 */
export interface Appointment {
  id: string;
  user_id: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
}

/**
 * Cart item for pantry orders
 */
export interface CartItem {
  item_id: string;
  item_name: string;
  quantity: number;
}

/**
 * Pantry order type
 */
export interface Order {
  order_id: string;
  student_id: string;
  appointment_id?: string;
  items: CartItem[];
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

/**
 * Data required to book a pantry appointment
 */
export interface BookAppointmentData {
  appointment_time: string;
  duration_minutes?: number;
}

/**
 * Response from booking an appointment
 */
export interface BookAppointmentResponse {
  appointment: Appointment;
  message: string;
}

/**
 * Response from getting available slots
 */
export interface AvailableSlotsResponse {
  slots: TimeSlot[];
}

/**
 * Response from generating smart cart
 */
export interface SmartCartResponse {
  items: PantryItem[];
}
