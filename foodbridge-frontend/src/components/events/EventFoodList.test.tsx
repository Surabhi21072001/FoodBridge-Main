import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventFoodList from './EventFoodList';
import type { Listing, User } from '../../types';

// Mock dependencies
vi.mock('../listings/ListingCard', () => {
  return {
    default: function MockListingCard({
      listing,
      onReserve,
    }: {
      listing: Listing;
      onReserve?: (id: string) => void;
    }) {
      return (
        <div data-testid={`listing-card-${listing.listing_id}`}>
          <h3>{listing.food_name}</h3>
          <button
            onClick={() => onReserve?.(listing.listing_id)}
            data-testid={`reserve-btn-${listing.listing_id}`}
          >
            Reserve
          </button>
        </div>
      );
    },
  };
});

vi.mock('../shared/Modal', () => {
  return {
    default: function MockModal({
      isOpen,
      onClose,
      title,
      children,
    }: {
      isOpen: boolean;
      onClose: () => void;
      title: string;
      children: React.ReactNode;
    }) {
      if (!isOpen) return null;
      return (
        <div data-testid="reservation-modal">
          <h2>{title}</h2>
          {children}
          <button onClick={onClose} data-testid="close-modal">
            Close
          </button>
        </div>
      );
    },
  };
});

vi.mock('../listings/ReservationForm', () => {
  return {
    default: function MockReservationForm({
      listing,
      onSubmit,
      onCancel,
    }: {
      listing: Listing;
      onSubmit: (quantity: number) => Promise<void>;
      onCancel: () => void;
    }) {
      return (
        <div data-testid="reservation-form">
          <p>Reserving: {listing.food_name}</p>
          <button
            onClick={() => onSubmit(1)}
            data-testid="confirm-reservation"
          >
            Confirm
          </button>
          <button onClick={onCancel} data-testid="cancel-reservation">
            Cancel
          </button>
        </div>
      );
    },
  };
});

vi.mock('../../hooks/useToast', () => {
  return {
    default: function useToast() {
      return {
        showToast: vi.fn(),
      };
    },
  };
});

const mockListing: Listing = {
  listing_id: '1',
  provider_id: 'provider1',
  food_name: 'Pizza Party',
  description: 'Free pizza for students',
  quantity: 50,
  available_quantity: 30,
  location: 'Student Center',
  pickup_window_start: new Date(Date.now() + 3600000).toISOString(),
  pickup_window_end: new Date(Date.now() + 7200000).toISOString(),
  food_type: 'Italian',
  dietary_tags: ['vegetarian'],
  listing_type: 'event',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockUser: User = {
  user_id: 'student1',
  email: 'student@example.com',
  role: 'student',
  created_at: new Date().toISOString(),
};

describe('EventFoodList', () => {
  it('renders empty state when no listings provided', () => {
    render(<EventFoodList listings={[]} />);
    expect(screen.getByText('No event food available at this time.')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<EventFoodList listings={[]} isLoading={true} />);
    const skeletons = screen.getAllByRole('generic', { hidden: true });
    // Check that skeleton elements are rendered (they have animate-pulse class)
    const animatedElements = skeletons.filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('renders listing cards for each event food listing', () => {
    const listings = [mockListing, { ...mockListing, listing_id: '2', food_name: 'Tacos' }];
    render(<EventFoodList listings={listings} />);

    expect(screen.getByText('Pizza Party')).toBeInTheDocument();
    expect(screen.getByText('Tacos')).toBeInTheDocument();
  });

  it('opens reservation modal when reserve button clicked', async () => {
    render(<EventFoodList listings={[mockListing]} currentUser={mockUser} />);

    const reserveBtn = screen.getByTestId(`reserve-btn-${mockListing.listing_id}`);
    fireEvent.click(reserveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('reservation-modal')).toBeInTheDocument();
      expect(screen.getByText('Reserve Event Food')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button clicked', async () => {
    render(<EventFoodList listings={[mockListing]} currentUser={mockUser} />);

    const reserveBtn = screen.getByTestId(`reserve-btn-${mockListing.listing_id}`);
    fireEvent.click(reserveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('reservation-modal')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByTestId('cancel-reservation');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('reservation-modal')).not.toBeInTheDocument();
    });
  });

  it('calls onReservationSuccess callback when reservation confirmed', async () => {
    const onReservationSuccess = vi.fn();
    render(
      <EventFoodList
        listings={[mockListing]}
        currentUser={mockUser}
        onReservationSuccess={onReservationSuccess}
      />
    );

    const reserveBtn = screen.getByTestId(`reserve-btn-${mockListing.listing_id}`);
    fireEvent.click(reserveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('reservation-modal')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-reservation');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onReservationSuccess).toHaveBeenCalled();
    });
  });

  it('passes correct props to ListingCard', () => {
    render(<EventFoodList listings={[mockListing]} currentUser={mockUser} />);

    const listingCard = screen.getByTestId(`listing-card-${mockListing.listing_id}`);
    expect(listingCard).toBeInTheDocument();
  });
});
