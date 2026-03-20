import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ListingCard from './ListingCard';
import type { Listing, User } from '../../types';

describe('ListingCard Component', () => {
  const mockListing: Listing = {
    listing_id: '1',
    provider_id: 'provider-1',
    food_name: 'Pizza Night',
    description: 'Leftover pizza from event',
    quantity: 10,
    available_quantity: 5,
    location: 'Student Center',
    pickup_window_start: '2024-03-15T18:00:00Z',
    pickup_window_end: '2024-03-15T20:00:00Z',
    food_type: 'Italian',
    dietary_tags: ['vegetarian', 'gluten-free'],
    listing_type: 'donation',
    status: 'active',
    created_at: '2024-03-14T10:00:00Z',
    updated_at: '2024-03-14T10:00:00Z',
  };

  const mockStudent: User = {
    id: 'student-1',
    email: 'student@example.com',
    role: 'student',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockProvider: User = {
    id: 'provider-1',
    email: 'provider@example.com',
    role: 'provider',
    created_at: '2024-01-01T00:00:00Z',
  };

  describe('Rendering', () => {
    it('should render listing card with all required information', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByText('Pizza Night')).toBeInTheDocument();
      expect(screen.getByText('Leftover pizza from event')).toBeInTheDocument();
      expect(screen.getByText('Student Center')).toBeInTheDocument();
      expect(screen.getByText(/5 of 10 available/)).toBeInTheDocument();
    });

    it('should display listing type badge', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByText('donation')).toBeInTheDocument();
    });

    it('should display dietary tags', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByText('vegetarian')).toBeInTheDocument();
      expect(screen.getByText('gluten-free')).toBeInTheDocument();
    });

    it('should format and display pickup window correctly', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      // Should display date and time range
      const pickupText = screen.getByText(/Mar 15/);
      expect(pickupText).toBeInTheDocument();
    });

    it('should render card with test id', () => {
      const { container } = render(
        <ListingCard listing={mockListing} currentUser={mockStudent} />
      );

      expect(container.querySelector('[data-testid="listing-card-1"]')).toBeInTheDocument();
    });

    it('should handle empty dietary tags', () => {
      const listingWithoutTags = { ...mockListing, dietary_tags: [] };
      const { container } = render(
        <ListingCard listing={listingWithoutTags} currentUser={mockStudent} />
      );

      // Should not render dietary tags section
      const tags = container.querySelectorAll('[class*="bg-green-50"]');
      expect(tags.length).toBe(0);
    });
  });

  describe('Student Actions', () => {
    it('should display reserve button for students', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      const reserveButton = screen.getByTestId('reserve-button-1');
      expect(reserveButton).toBeInTheDocument();
      expect(reserveButton).toHaveTextContent('Reserve');
    });

    it('should call onReserve when reserve button is clicked', async () => {
      const user = userEvent.setup();
      const onReserve = vi.fn();

      render(
        <ListingCard
          listing={mockListing}
          currentUser={mockStudent}
          onReserve={onReserve}
        />
      );

      const reserveButton = screen.getByTestId('reserve-button-1');
      await user.click(reserveButton);

      expect(onReserve).toHaveBeenCalledWith('1');
    });

    it('should disable reserve button when no items available', () => {
      const soldOutListing = { ...mockListing, available_quantity: 0 };

      render(
        <ListingCard listing={soldOutListing} currentUser={mockStudent} />
      );

      const reserveButton = screen.getByTestId('reserve-button-1');
      expect(reserveButton).toBeDisabled();
      expect(reserveButton).toHaveTextContent('Sold Out');
    });

    it('should not display edit/delete buttons for students', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button-1')).not.toBeInTheDocument();
    });
  });

  describe('Provider Actions', () => {
    it('should display edit and delete buttons for own listings', () => {
      render(<ListingCard listing={mockListing} currentUser={mockProvider} />);

      expect(screen.getByTestId('edit-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button-1')).toBeInTheDocument();
    });

    it('should not display reserve button for own listings', () => {
      render(<ListingCard listing={mockListing} currentUser={mockProvider} />);

      expect(screen.queryByTestId('reserve-button-1')).not.toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <ListingCard
          listing={mockListing}
          currentUser={mockProvider}
          onEdit={onEdit}
        />
      );

      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <ListingCard
          listing={mockListing}
          currentUser={mockProvider}
          onDelete={onDelete}
        />
      );

      const deleteButton = screen.getByTestId('delete-button-1');
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should display reserve button for other providers listings', () => {
      const otherProvider: User = {
        id: 'provider-2',
        email: 'other@example.com',
        role: 'provider',
        created_at: '2024-01-01T00:00:00Z',
      };

      render(
        <ListingCard listing={mockListing} currentUser={otherProvider} />
      );

      expect(screen.getByTestId('reserve-button-1')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument();
    });
  });

  describe('No Current User', () => {
    it('should display reserve button when no current user', () => {
      render(<ListingCard listing={mockListing} currentUser={null} />);

      expect(screen.getByTestId('reserve-button-1')).toBeInTheDocument();
    });

    it('should not display edit/delete buttons when no current user', () => {
      render(<ListingCard listing={mockListing} currentUser={null} />);

      expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button-1')).not.toBeInTheDocument();
    });
  });

  describe('Quantity Display', () => {
    it('should display correct quantity when items available', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByText(/5 of 10 available/)).toBeInTheDocument();
    });

    it('should display zero quantity correctly', () => {
      const noItemsListing = { ...mockListing, available_quantity: 0 };

      render(
        <ListingCard listing={noItemsListing} currentUser={mockStudent} />
      );

      expect(screen.getByText(/0 of 10 available/)).toBeInTheDocument();
    });

    it('should display full quantity when all items available', () => {
      const fullListing = { ...mockListing, available_quantity: 10 };

      render(
        <ListingCard listing={fullListing} currentUser={mockStudent} />
      );

      expect(screen.getByText(/10 of 10 available/)).toBeInTheDocument();
    });
  });

  describe('Listing Types', () => {
    it('should display donation type', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByText('donation')).toBeInTheDocument();
    });

    it('should display event type', () => {
      const eventListing = { ...mockListing, listing_type: 'event' as const };

      render(
        <ListingCard listing={eventListing} currentUser={mockStudent} />
      );

      expect(screen.getByText('event')).toBeInTheDocument();
    });

    it('should display dining_deal type', () => {
      const dealListing = { ...mockListing, listing_type: 'dining_deal' as const };

      render(
        <ListingCard listing={dealListing} currentUser={mockStudent} />
      );

      expect(screen.getByText('dining_deal')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(
        <ListingCard listing={mockListing} currentUser={mockStudent} />
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-lg', 'font-semibold');
    });

    it('should have descriptive button labels', () => {
      render(<ListingCard listing={mockListing} currentUser={mockProvider} />);

      expect(screen.getByTestId('edit-button-1')).toHaveTextContent('Edit');
      expect(screen.getByTestId('delete-button-1')).toHaveTextContent('Delete');
    });

    it('should have descriptive test ids for interactive elements', () => {
      render(<ListingCard listing={mockListing} currentUser={mockStudent} />);

      expect(screen.getByTestId('reserve-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('listing-card-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long food names', () => {
      const longNameListing = {
        ...mockListing,
        food_name: 'A'.repeat(100),
      };

      render(
        <ListingCard listing={longNameListing} currentUser={mockStudent} />
      );

      // Should render without breaking layout (line-clamp applied)
      const heading = screen.getByText(/A+/);
      expect(heading).toHaveClass('line-clamp-2');
    });

    it('should handle very long descriptions', () => {
      const longDescListing = {
        ...mockListing,
        description: 'B'.repeat(200),
      };

      render(
        <ListingCard listing={longDescListing} currentUser={mockStudent} />
      );

      // Should render without breaking layout (line-clamp applied)
      const description = screen.getByText(/B+/);
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should handle many dietary tags', () => {
      const manyTagsListing = {
        ...mockListing,
        dietary_tags: [
          'vegetarian',
          'vegan',
          'gluten-free',
          'dairy-free',
          'nut-free',
          'kosher',
        ],
      };

      render(
        <ListingCard listing={manyTagsListing} currentUser={mockStudent} />
      );

      expect(screen.getByText('vegetarian')).toBeInTheDocument();
      expect(screen.getByText('vegan')).toBeInTheDocument();
      expect(screen.getByText('gluten-free')).toBeInTheDocument();
      expect(screen.getByText('dairy-free')).toBeInTheDocument();
      expect(screen.getByText('nut-free')).toBeInTheDocument();
      expect(screen.getByText('kosher')).toBeInTheDocument();
    });
  });
});
