import { describe, it, expect, vi, beforeEach } from 'vitest';
import listingsService from './listingsService';
import api from './api';
import type { Listing, PaginatedResponse } from '../types/listings';

// Mock the API
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ListingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getListings', () => {
    it('should fetch listings without filters', async () => {
      const mockListings: Listing[] = [
        {
          listing_id: '1',
          provider_id: 'provider1',
          food_name: 'Pizza',
          description: 'Leftover pizza',
          quantity: 5,
          available_quantity: 5,
          location: 'Building A',
          pickup_window_start: '2024-01-15T12:00:00Z',
          pickup_window_end: '2024-01-15T14:00:00Z',
          food_type: 'Italian',
          dietary_tags: ['vegetarian'],
          listing_type: 'donation',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      const mockPaginationData = {
        data: mockListings,
        pagination: {
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings();

      expect(api.get).toHaveBeenCalledWith('/listings', {});
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with pagination parameters', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 2,
          limit: 10,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        page: 2,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        page: 2,
        limit: 10,
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with dietary filters', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        dietary: ['vegetarian', 'vegan'],
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        dietary: ['vegetarian', 'vegan'],
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with location filter', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        location: 'Building A',
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        location: 'Building A',
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with food type filter', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        food_type: 'Italian',
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        food_type: 'Italian',
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with listing type filter', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        listing_type: 'event',
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        listing_type: 'event',
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should fetch listings with multiple filters combined', async () => {
      const mockPaginationData = {
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockPaginationData,
        message: 'Success',
      });

      const result = await listingsService.getListings({
        page: 1,
        limit: 20,
        dietary: ['vegetarian'],
        location: 'Building A',
        food_type: 'Italian',
        listing_type: 'donation',
      });

      expect(api.get).toHaveBeenCalledWith('/listings', {
        page: 1,
        limit: 20,
        dietary: ['vegetarian'],
        location: 'Building A',
        food_type: 'Italian',
        listing_type: 'donation',
      });
      expect(result).toEqual(mockPaginationData);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(listingsService.getListings()).rejects.toThrow('Network error');
    });
  });

  describe('getListingById', () => {
    it('should fetch a single listing by ID', async () => {
      const mockListing: Listing = {
        listing_id: '1',
        provider_id: 'provider1',
        food_name: 'Pizza',
        description: 'Leftover pizza',
        quantity: 5,
        available_quantity: 5,
        location: 'Building A',
        pickup_window_start: '2024-01-15T12:00:00Z',
        pickup_window_end: '2024-01-15T14:00:00Z',
        food_type: 'Italian',
        dietary_tags: ['vegetarian'],
        listing_type: 'donation',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockListing,
        message: 'Success',
      });

      const result = await listingsService.getListingById('1');

      expect(api.get).toHaveBeenCalledWith('/listings/1');
      expect(result).toEqual(mockListing);
    });

    it('should throw error when listing not found', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Listing not found'));

      await expect(listingsService.getListingById('nonexistent')).rejects.toThrow(
        'Listing not found'
      );
    });
  });

  describe('createListing', () => {
    it('should create a new listing', async () => {
      const createData = {
        food_name: 'Pizza',
        description: 'Leftover pizza',
        quantity: 5,
        location: 'Building A',
        pickup_window_start: '2024-01-15T12:00:00Z',
        pickup_window_end: '2024-01-15T14:00:00Z',
        food_type: 'Italian',
        dietary_tags: ['vegetarian'],
        listing_type: 'donation' as const,
      };

      const mockCreatedListing: Listing = {
        listing_id: '1',
        provider_id: 'provider1',
        ...createData,
        available_quantity: 5,
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockCreatedListing,
        message: 'Success',
      });

      const result = await listingsService.createListing(createData);

      expect(api.post).toHaveBeenCalledWith('/listings', createData);
      expect(result).toEqual(mockCreatedListing);
    });

    it('should throw error on creation failure', async () => {
      const createData = {
        food_name: 'Pizza',
        description: 'Leftover pizza',
        quantity: 5,
        location: 'Building A',
        pickup_window_start: '2024-01-15T12:00:00Z',
        pickup_window_end: '2024-01-15T14:00:00Z',
        food_type: 'Italian',
        dietary_tags: ['vegetarian'],
        listing_type: 'donation' as const,
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Validation error'));

      await expect(listingsService.createListing(createData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('updateListing', () => {
    it('should update an existing listing', async () => {
      const updateData = {
        food_name: 'Updated Pizza',
        quantity: 3,
      };

      const mockUpdatedListing: Listing = {
        listing_id: '1',
        provider_id: 'provider1',
        food_name: 'Updated Pizza',
        description: 'Leftover pizza',
        quantity: 3,
        available_quantity: 3,
        location: 'Building A',
        pickup_window_start: '2024-01-15T12:00:00Z',
        pickup_window_end: '2024-01-15T14:00:00Z',
        food_type: 'Italian',
        dietary_tags: ['vegetarian'],
        listing_type: 'donation',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
      };

      vi.mocked(api.patch).mockResolvedValue({
        success: true,
        data: mockUpdatedListing,
        message: 'Success',
      });

      const result = await listingsService.updateListing('1', updateData);

      expect(api.patch).toHaveBeenCalledWith('/listings/1', updateData);
      expect(result).toEqual(mockUpdatedListing);
    });

    it('should throw error on update failure', async () => {
      const updateData = {
        food_name: 'Updated Pizza',
      };

      vi.mocked(api.patch).mockRejectedValue(new Error('Listing not found'));

      await expect(listingsService.updateListing('nonexistent', updateData)).rejects.toThrow(
        'Listing not found'
      );
    });
  });

  describe('deleteListing', () => {
    it('should delete a listing', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await listingsService.deleteListing('1');

      expect(api.delete).toHaveBeenCalledWith('/listings/1');
    });

    it('should throw error on deletion failure', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Listing not found'));

      await expect(listingsService.deleteListing('nonexistent')).rejects.toThrow(
        'Listing not found'
      );
    });
  });

  describe('getProviderListings', () => {
    it('should fetch all listings for a provider', async () => {
      const mockListings: Listing[] = [
        {
          listing_id: '1',
          provider_id: 'provider1',
          food_name: 'Pizza',
          description: 'Leftover pizza',
          quantity: 5,
          available_quantity: 5,
          location: 'Building A',
          pickup_window_start: '2024-01-15T12:00:00Z',
          pickup_window_end: '2024-01-15T14:00:00Z',
          food_type: 'Italian',
          dietary_tags: ['vegetarian'],
          listing_type: 'donation',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          listing_id: '2',
          provider_id: 'provider1',
          food_name: 'Pasta',
          description: 'Leftover pasta',
          quantity: 3,
          available_quantity: 3,
          location: 'Building B',
          pickup_window_start: '2024-01-16T12:00:00Z',
          pickup_window_end: '2024-01-16T14:00:00Z',
          food_type: 'Italian',
          dietary_tags: ['vegan'],
          listing_type: 'donation',
          status: 'active',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockListings,
        message: 'Success',
      });

      const result = await listingsService.getProviderListings();

      expect(api.get).toHaveBeenCalledWith('/listings/provider/my-listings');
      expect(result).toEqual(mockListings);
    });

    it('should return empty array if provider has no listings', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
      });

      const result = await listingsService.getProviderListings();

      expect(api.get).toHaveBeenCalledWith('/listings/provider/my-listings');
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'));

      await expect(listingsService.getProviderListings()).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
