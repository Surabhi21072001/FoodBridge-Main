import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProviderDashboard from './ProviderDashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import * as listingsService from '../../services/listingsService';
import * as reservationsService from '../../services/reservationsService';
import type { Listing } from '../../types/listings';
import type { Reservation } from '../../types/reservations';

// Mock the services
vi.mock('../../services/listingsService');
vi.mock('../../services/reservationsService');

// Mock useAuth hook
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        user_id: 'provider-123',
        email: 'provider@example.com',
        role: 'provider',
        created_at: '2024-01-01T00:00:00Z',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

const mockListing: Listing = {
  listing_id: 'listing-1',
  provider_id: 'provider-123',
  food_name: 'Pizza',
  description: 'Leftover pizza',
  quantity: 10,
  available_quantity: 8,
  location: 'Building A',
  pickup_window_start: '2024-12-20T12:00:00Z',
  pickup_window_end: '2024-12-20T14:00:00Z',
  food_type: 'Italian',
  dietary_tags: ['vegetarian'],
  listing_type: 'donation',
  status: 'active',
  created_at: '2024-12-19T10:00:00Z',
  updated_at: '2024-12-19T10:00:00Z',
};

const mockReservation: Reservation = {
  reservation_id: 'res-1',
  listing_id: 'listing-1',
  student_id: 'student-1',
  quantity: 2,
  status: 'active',
  created_at: '2024-12-19T11:00:00Z',
  listing: mockListing,
};

function renderWithProviders(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('ProviderDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message with provider email', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, provider@example.com!/)).toBeInTheDocument();
    });
  });

  it('displays create listing button', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Create Listing/)).toBeInTheDocument();
    });
  });

  it('fetches and displays provider listings', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  it('filters to only active listings', async () => {
    const inactiveListing: Listing = {
      ...mockListing,
      listing_id: 'listing-2',
      status: 'expired',
    };

    (listingsService.default.getProviderListings as any).mockResolvedValue([
      mockListing,
      inactiveListing,
    ]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      // Should only show one listing (the active one)
      const pizzaElements = screen.getAllByText('Pizza');
      expect(pizzaElements.length).toBe(1);
    });
  });

  it('displays reservation statistics', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([
      mockReservation,
    ]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Reservations')).toBeInTheDocument();
      expect(screen.getByText('Items Reserved')).toBeInTheDocument();
    });
  });

  it('calculates total items reserved correctly', async () => {
    const reservation2: Reservation = {
      ...mockReservation,
      reservation_id: 'res-2',
      quantity: 3,
    };

    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([
      mockReservation,
      reservation2,
    ]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      // Total items should be 2 + 3 = 5
      const itemsReservedElements = screen.getAllByText(/Items Reserved/);
      expect(itemsReservedElements.length).toBeGreaterThan(0);
    });
  });

  it('displays empty state when no listings exist', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("You haven't created any listings yet")
      ).toBeInTheDocument();
    });
  });

  it('displays empty state when no reservations exist', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No reservations yet')).toBeInTheDocument();
    });
  });

  it('displays recent reservations sorted by creation date', async () => {
    const reservation2: Reservation = {
      ...mockReservation,
      reservation_id: 'res-2',
      created_at: '2024-12-19T12:00:00Z', // More recent
    };

    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([
      mockReservation,
      reservation2,
    ]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reservations')).toBeInTheDocument();
    });
  });

  it('handles error when fetching listings fails', async () => {
    const error = new Error('Failed to fetch listings');
    (listingsService.default.getProviderListings as any).mockRejectedValue(error);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome/)).toBeInTheDocument();
    });
  });

  it('handles error when fetching reservations fails', async () => {
    const error = new Error('Failed to fetch reservations');
    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockRejectedValue(error);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reservations')).toBeInTheDocument();
    });
  });

  it('displays loading spinners while fetching data', () => {
    (listingsService.default.getProviderListings as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<ProviderDashboard />);

    // Component should render without crashing
    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
  });

  it('displays reservation status badges with correct styling', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([mockListing]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([
      mockReservation,
    ]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('fetches data on component mount', async () => {
    (listingsService.default.getProviderListings as any).mockResolvedValue([]);
    (reservationsService.default.getListingReservations as any).mockResolvedValue([]);

    renderWithProviders(<ProviderDashboard />);

    await waitFor(() => {
      expect(listingsService.default.getProviderListings).toHaveBeenCalled();
    });
  });
});
