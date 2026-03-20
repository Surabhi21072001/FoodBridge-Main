/**
 * Listing Types
 * Type definitions for food listings, filters, and related data structures
 */

/**
 * Food Listing
 * Represents a food listing available for reservation
 */
export interface Listing {
  listing_id: string;
  provider_id: string;
  food_name: string;
  description: string;
  quantity: number;
  available_quantity: number;
  location: string;
  pickup_window_start: string;
  pickup_window_end: string;
  food_type: string;
  dietary_tags: string[];
  listing_type: 'donation' | 'event' | 'dining_deal';
  status: 'active' | 'expired' | 'completed' | 'unavailable';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Listing Data
 * Data required to create a new food listing
 */
export interface CreateListingData {
  food_name: string;
  description: string;
  quantity: number;
  location: string;
  pickup_window_start: string;
  pickup_window_end: string;
  food_type: string;
  dietary_tags: string[];
  listing_type: 'donation' | 'event' | 'dining_deal';
  image?: File;
}

/**
 * Update Listing Data
 * Data for updating an existing food listing (all fields optional)
 */
export interface UpdateListingData {
  food_name?: string;
  description?: string;
  quantity?: number;
  location?: string;
  pickup_window_start?: string;
  pickup_window_end?: string;
  food_type?: string;
  dietary_tags?: string[];
  status?: 'active' | 'expired' | 'completed' | 'unavailable';
  image?: File;
}

/**
 * Listing Query Parameters
 * Parameters for filtering and paginating listings
 */
export interface ListingQueryParams {
  page?: number;
  limit?: number;
  dietary?: string[];
  location?: string;
  food_type?: string;
  listing_type?: 'donation' | 'event' | 'dining_deal';
  search?: string;
  provider_id?: string;
}

/**
 * Paginated Response
 * Generic paginated response wrapper for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Filter State
 * Current state of applied filters
 */
export interface FilterState {
  dietary: string[];
  location: string;
  food_type: string;
}
