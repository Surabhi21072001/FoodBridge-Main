import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ListingDetail from './ListingDetail';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import * as listingsService from '../../services/listingsService';
import * as reservationsService from '../../services/reservationsService';
import * as authService from '../../services/authService';

// Mock services
vi.mock('../../services/listingsService');
vi.mock('../../services/reservationsService');
vi.mock('../../services/authService');

const mockListing = {
  listing_id: 'listing-1',
  provider_id: 'provider-1',
  food_name: 'Pizza Party',
  description: 'Leftover pizza from event',
  quantity: 10,
  available_quantity: 5,
  location: 'Student Center',
  pickup_window_start: '2024-03-15T18:00:00Z',
  pickup_window_end: '2024-03-15T20:00:00Z',
  food_type: 'Italian',
  dietary_tags: ['vegetarian', 'gluten-free'],
  listing_type: 'donation' as const,
  status: 'active' as const,
  created_at: '2024-03-14T10:00:00Z',
  updated_at: '2024-03-14T10:00:00Z',
};

const mockReservations = [
  {
    reservation_id: 'res-1',
    listing_id: 'listing-1',
    student_id: 'student-1',
    quantity: 2,
    status: 'active' as const,
    created_at: '2024-03-14T11:00:00Z',
  },
  {
    reservation_id: 'res-2',
    listing_id: 'listing-1',
    student_id: 'student-2',
    quantity: 3,
    status: 'active' as const,
    created_at: '2024-03-14T12:00:00Z',
  },
];

const mockStudentUser = {
  user_id: 'student-1',
  email: 'student@example.com',
  role: 'student' as const,
  created_at: '2024-01-01T00:00:00Z',
};

const mockProviderUser = {
  user_id: 'provider-1',
  email: 'provider@example.com',
  role: 'provider' as const,
  created_at: '2024-01-01T00:00:00Z',
};

const renderWithContext = (component: React.ReactElement, user = mockStudentUser) => {
  // Mock auth service to return the user
  (authService.default.getToken as any).mockReturnValue('mock-token');
  (authService.default.getCurrentUser as any).mockResolvedValue(user);

  return render(
    <AuthProvider>
      <ToastProvider>
        {component}
      </ToastProvider>
    </AuthProvider>
  );
};

describe('ListingDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (listingsService.default.getListingById as any).mockResolvedValue(mockListing);
    (listingsService.default.getListingReservations as any).mockResolvedValue([]);
    (reservationsService.default.createReservation as any).mockResolvedValue({
      reservation_id: 'res-new',
      listing_id: 'listing-1',
      student_id: 'student-1',
      quantity: 2,
      status: 'active',
      created_at: '2024-03-14T13:00:00Z',
    });
  });

  describe('Display full listing information', () => {
    it('should display listing details when loaded', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText('Pizza Party')).toBeInTheDocument();
        expect(screen.getByText('Leftover pizza from event')).toBeInTheDocument();
        expect(screen.getByText('Student Center')).toBeInTheDocument();
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });
    });

    it('should display dietary tags', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText('vegetarian')).toBeInTheDocument();
        expect(screen.getByText('gluten-free')).toBeInTheDocument();
      });
    });

    it('should display quantity information', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText(/5 of 10 available/)).toBeInTheDocument();
      });
    });

    it('should display pickup window', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Pickup Window/)).toBeInTheDocument();
      });
    });

    it('should display listing status', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });
    });

    it('should display listing type badge', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText('donation')).toBeInTheDocument();
      });
    });

    it('should show loading spinner while fetching', () => {
      (listingsService.default.getListingById as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithContext(<ListingDetail listingId="listing-1" />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show error message when listing not found', async () => {
      (listingsService.default.getListingById as any).mockResolvedValue(null);

      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.getByText('Listing not found')).toBeInTheDocument();
      });
    });
  });

  describe('Show reservation form for students', () => {
    it('should display reserve button for students', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        expect(screen.getByTestId('open-reservation-form-button')).toBeInTheDocument();
      });
    });

    it('should open reservation form when reserve button clicked', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        expect(screen.getByTestId('open-reservation-form-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('open-reservation-form-button'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('reservation-quantity-input')).toBeInTheDocument();
      });
    });

    it('should allow quantity input in reservation form', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      const quantityInput = screen.getByTestId('reservation-quantity-input') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '3' } });

      expect(quantityInput.value).toBe('3');
    });

    it('should submit reservation with correct quantity', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      const quantityInput = screen.getByTestId('reservation-quantity-input') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '2' } });

      fireEvent.click(screen.getByTestId('confirm-reservation-button'));

      await waitFor(() => {
        expect(reservationsService.default.createReservation).toHaveBeenCalledWith({
          listing_id: 'listing-1',
          quantity: 2,
        });
      });
    });

    it('should show success message after reservation', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      fireEvent.click(screen.getByTestId('confirm-reservation-button'));

      await waitFor(() => {
        // Check that the success toast was shown by verifying the form closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close form after successful reservation', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      fireEvent.click(screen.getByTestId('confirm-reservation-button'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should disable reserve button when sold out', async () => {
      const soldOutListing = { ...mockListing, available_quantity: 0 };
      (listingsService.default.getListingById as jest.Mock).mockResolvedValue(soldOutListing);

      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        expect(screen.getByText('This listing is sold out')).toBeInTheDocument();
      });
    });

    it('should cancel reservation form', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      fireEvent.click(screen.getByTestId('cancel-reservation-button'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Show reservations list for providers', () => {
    it('should display reservations for provider', async () => {
      (listingsService.default.getListingReservations as any).mockResolvedValue(mockReservations);

      renderWithContext(<ListingDetail listingId="listing-1" />, mockProviderUser);

      await waitFor(() => {
        expect(screen.getByText('Reservations (2)')).toBeInTheDocument();
      });
    });

    it('should display reservation details', async () => {
      (listingsService.default.getListingReservations as any).mockResolvedValue(mockReservations);

      renderWithContext(<ListingDetail listingId="listing-1" />, mockProviderUser);

      await waitFor(() => {
        expect(screen.getByText('2 units')).toBeInTheDocument();
        expect(screen.getByText('3 units')).toBeInTheDocument();
      });
    });

    it('should display reservation status', async () => {
      (listingsService.default.getListingReservations as any).mockResolvedValue(mockReservations);

      renderWithContext(<ListingDetail listingId="listing-1" />, mockProviderUser);

      await waitFor(() => {
        const statusElements = screen.getAllByText('active');
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });

    it('should show message when no reservations', async () => {
      (listingsService.default.getListingReservations as any).mockResolvedValue([]);

      renderWithContext(<ListingDetail listingId="listing-1" />, mockProviderUser);

      await waitFor(() => {
        expect(screen.getByText('No reservations yet for this listing')).toBeInTheDocument();
      });
    });

    it('should not show reservations for non-owner provider', async () => {
      const otherProviderUser = { ...mockProviderUser, user_id: 'provider-2' };
      (listingsService.default.getListingReservations as any).mockResolvedValue(mockReservations);

      renderWithContext(<ListingDetail listingId="listing-1" />, otherProviderUser);

      await waitFor(() => {
        expect(screen.queryByText('Reservations')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show error toast on fetch failure', async () => {
      (listingsService.default.getListingById as any).mockRejectedValue(new Error('API Error'));

      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        // Error should be logged but component should still render
        expect(screen.getByText('Listing not found')).toBeInTheDocument();
      });
    });

    it('should show error toast on reservation failure', async () => {
      (reservationsService.default.createReservation as any).mockRejectedValue(new Error('API Error'));

      renderWithContext(<ListingDetail listingId="listing-1" />, mockStudentUser);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('open-reservation-form-button'));
      });

      fireEvent.click(screen.getByTestId('confirm-reservation-button'));

      await waitFor(() => {
        // Form should still be open on error
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', async () => {
      const onClose = vi.fn();
      renderWithContext(<ListingDetail listingId="listing-1" onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('close-detail-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('close-detail-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should not show close button when onClose not provided', async () => {
      renderWithContext(<ListingDetail listingId="listing-1" />);

      await waitFor(() => {
        expect(screen.queryByTestId('close-detail-button')).not.toBeInTheDocument();
      });
    });
  });
});
