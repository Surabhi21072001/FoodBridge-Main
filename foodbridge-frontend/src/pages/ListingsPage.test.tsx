import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ListingsPage from './ListingsPage';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import listingsService from '../services/listingsService';
import type { Listing } from '../types';

// Mock the services
vi.mock('../services/listingsService');
vi.mock('../hooks/useToast', () => ({
  default: () => ({
    showToast: vi.fn(),
  }),
}));

const mockListings: Listing[] = [
  {
    listing_id: '1',
    provider_id: 'provider-1',
    food_name: 'Pizza Night',
    description: 'Leftover pizza',
    quantity: 10,
    available_quantity: 5,
    location: 'Student Center',
    pickup_window_start: '2024-03-15T18:00:00Z',
    pickup_window_end: '2024-03-15T20:00:00Z',
    food_type: 'Italian',
    dietary_tags: ['vegetarian'],
    listing_type: 'donation',
    status: 'active',
    created_at: '2024-03-14T10:00:00Z',
    updated_at: '2024-03-14T10:00:00Z',
  },
  {
    listing_id: '2',
    provider_id: 'provider-2',
    food_name: 'Sushi Rolls',
    description: 'Fresh sushi',
    quantity: 20,
    available_quantity: 15,
    location: 'Library',
    pickup_window_start: '2024-03-15T12:00:00Z',
    pickup_window_end: '2024-03-15T14:00:00Z',
    food_type: 'Asian',
    dietary_tags: ['gluten-free'],
    listing_type: 'event',
    status: 'active',
    created_at: '2024-03-14T10:00:00Z',
    updated_at: '2024-03-14T10:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ToastProvider>
        {component}
      </ToastProvider>
    </AuthProvider>
  );
};

describe('ListingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should display loading spinner on initial load', () => {
      vi.mocked(listingsService.getListings).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<ListingsPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should fetch and display listings on mount', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Night')).toBeInTheDocument();
        expect(screen.getByText('Sushi Rolls')).toBeInTheDocument();
      });
    });

    it('should display page header', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Food Listings')).toBeInTheDocument();
      });
    });

    it('should display filters sidebar', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('listing-filters')).toBeInTheDocument();
      });
    });
  });

  describe('Listings Display', () => {
    it('should display all listings in grid', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('listing-card-2')).toBeInTheDocument();
      });
    });

    it('should display results count', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 50,
          page: 1,
          limit: 20,
          total_pages: 3,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 50 listings')).toBeInTheDocument();
      });
    });

    it('should display empty state when no listings', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: [],
        pagination: {
          total_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('No listings found')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should fetch listings with search query', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: [mockListings[0]],
        pagination: {
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Night')).toBeInTheDocument();
      });

      vi.mocked(listingsService.getListings).mockClear();
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: [mockListings[0]],
        pagination: {
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'pizza');

      await waitFor(() => {
        expect(listingsService.getListings).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should fetch listings with applied filters', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: [mockListings[0]],
        pagination: {
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('listing-filters')).toBeInTheDocument();
      });

      vi.mocked(listingsService.getListings).mockClear();
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: [mockListings[0]],
        pagination: {
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      const vegetarianCheckbox = screen.getByTestId('dietary-checkbox-Vegetarian');
      await userEvent.click(vegetarianCheckbox);

      await waitFor(() => {
        expect(listingsService.getListings).toHaveBeenCalled();
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('should display infinite scroll trigger when more results available', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 50,
          page: 1,
          limit: 20,
          total_pages: 3,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('infinite-scroll-trigger')).toBeInTheDocument();
      });
    });

    it('should not display infinite scroll trigger when no more results', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('infinite-scroll-trigger')).not.toBeInTheDocument();
      });
    });

    it('should display end of results message when all listings loaded', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText("You've reached the end of the listings.")).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display empty state on fetch failure', async () => {
      vi.mocked(listingsService.getListings).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('No listings found')).toBeInTheDocument();
      });
    });

    it('should log error to console on fetch failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(listingsService.getListings).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching listings:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Responsive Layout', () => {
    it('should render filters in sidebar', async () => {
      vi.mocked(listingsService.getListings).mockResolvedValue({
        data: mockListings,
        pagination: {
          total_count: 2,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      });

      const { container } = renderWithProviders(<ListingsPage />);

      await waitFor(() => {
        const filtersSidebar = container.querySelector('.lg\\:col-span-1');
        expect(filtersSidebar).toBeInTheDocument();
      });
    });
  });
});
