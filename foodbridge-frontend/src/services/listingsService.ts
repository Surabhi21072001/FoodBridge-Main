import api from './api';
import type {
  Listing,
  CreateListingData,
  UpdateListingData,
  ListingQueryParams,
  PaginatedResponse,
} from '../types/listings';

/**
 * Listings Service
 * Handles all food listing operations including fetching, creating, updating, and deleting listings
 */
class ListingsService {
  /**
   * Get paginated list of food listings with optional filters
   * @param params - Query parameters for pagination and filtering
   * @returns Paginated response containing listings and pagination metadata
   */
  async getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
    try {
      // Build query parameters object
      const queryParams: Record<string, any> = {};

      if (params) {
        if (params.page !== undefined) {
          queryParams.page = params.page;
        }
        if (params.limit !== undefined) {
          queryParams.limit = params.limit;
        }
        if (params.dietary && params.dietary.length > 0) {
          // Convert array to comma-separated string for query parameter
          queryParams.dietary_tags = params.dietary.join(',');
        }
        if (params.location) {
          queryParams.location = params.location;
        }
        if (params.food_type) {
          queryParams.food_type = params.food_type;
        }
        if (params.listing_type) {
          queryParams.listing_type = params.listing_type;
        }
        if (params.search) {
          queryParams.search = params.search;
        }
        if (params.provider_id) {
          queryParams.provider_id = params.provider_id;
        }
      }

      const response = await api.get<any>('/listings', queryParams);
      // api.get returns response.data directly, which is the entire envelope
      // { success, message, data: [...], pagination: {...} }
      const envelope = response;
      if (envelope && Array.isArray(envelope.data)) {
        const pagination = envelope.pagination || { total: 0, page: 1, limit: 20, total_pages: 0 };
        return {
          data: envelope.data,
          pagination: {
            total_count: pagination.total || 0,
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total_pages: pagination.total_pages || 0
          }
        };
      }
      // Fallback if response structure is different
      if (envelope && Array.isArray(envelope)) {
        return {
          data: envelope,
          pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 }
        };
      }
      return { data: [], pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single listing by ID
   * @param id - Listing ID
   * @returns Listing details
   */
  async getListingById(id: string): Promise<Listing> {
    try {
      const response = await api.get<any>(`/listings/${id}`);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new food listing
   * @param data - Listing creation data
   * @returns Created listing with ID
   */
  async createListing(data: CreateListingData): Promise<Listing> {
    try {
      // Map frontend field names to backend schema
      const listingTypeToCategory: Record<string, string> = {
        donation: 'meal',
        event: 'event_food',
        dining_deal: 'deal',
      };

      const payload = {
        title: data.food_name,
        description: data.description,
        category: listingTypeToCategory[data.listing_type] || 'meal',
        cuisine_type: data.food_type,
        dietary_tags: data.dietary_tags,
        quantity_available: data.quantity,
        pickup_location: data.location,
        available_from: new Date(data.pickup_window_start).toISOString(),
        available_until: new Date(data.pickup_window_end).toISOString(),
      };

      const response = await api.post<any>('/listings', payload);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing food listing
   * @param id - Listing ID
   * @param data - Partial listing data to update
   * @returns Updated listing
   */
  async updateListing(id: string, data: UpdateListingData): Promise<Listing> {
    try {
      const payload: Record<string, any> = {};
      if (data.food_name !== undefined) payload.title = data.food_name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.quantity !== undefined) payload.quantity_available = data.quantity;
      if (data.location !== undefined) payload.pickup_location = data.location;
      if (data.pickup_window_start !== undefined) payload.available_from = new Date(data.pickup_window_start).toISOString();
      if (data.pickup_window_end !== undefined) payload.available_until = new Date(data.pickup_window_end).toISOString();
      if (data.food_type !== undefined) payload.cuisine_type = data.food_type;
      if (data.dietary_tags !== undefined) payload.dietary_tags = data.dietary_tags;
      if (data.status !== undefined) payload.status = data.status;

      const response = await api.patch<any>(`/listings/${id}`, payload);
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a food listing
   * @param id - Listing ID
   */
  async deleteListing(id: string): Promise<void> {
    try {
      await api.delete<void>(`/listings/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all listings created by the current authenticated provider
   * @returns Array of listings created by the provider
   */
  async getProviderListings(): Promise<Listing[]> {
    try {
      const response = await api.get<any>('/listings/provider/my-listings');
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reservations for a specific listing
   * @param listingId - Listing ID
   * @returns Array of reservations for the listing
   */
  async getListingReservations(listingId: string): Promise<any[]> {
    try {
      const response = await api.get<any>(`/listings/${listingId}/reservations`);
      return response?.data || [];
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const listingsService = new ListingsService();
export default listingsService;
