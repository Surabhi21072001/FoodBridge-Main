import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EditListingForm from './EditListingForm';
import listingsService from '../../services/listingsService';
import * as ToastHook from '../../hooks/useToast';
import type { Listing } from '../../types/listings';

// Mock the services
vi.mock('../../services/listingsService');
vi.mock('../../hooks/useToast');

const mockShowToast = vi.fn();

const mockListing: Listing = {
  listing_id: '123',
  provider_id: 'provider-1',
  food_name: 'Pizza',
  description: 'Delicious leftover pizza',
  quantity: 10,
  available_quantity: 8,
  location: 'Student Center',
  pickup_window_start: '2025-03-15T14:00',
  pickup_window_end: '2025-03-15T16:00',
  food_type: 'Prepared Meal',
  dietary_tags: ['Vegetarian'],
  listing_type: 'donation',
  status: 'active',
  created_at: '2025-03-13T10:00:00Z',
  updated_at: '2025-03-13T10:00:00Z',
};

describe('EditListingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ToastHook.default as any).mockReturnValue({
      showToast: mockShowToast,
    });
    (listingsService.getListingById as any).mockResolvedValue(mockListing);
  });

  describe('Form Loading', () => {
    it('should display loading spinner while fetching listing', () => {
      (listingsService.getListingById as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockListing), 100))
      );

      render(<EditListingForm listingId="123" />);

      // Check for the spinner div with animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display error toast if listing fetch fails', async () => {
      (listingsService.getListingById as any).mockRejectedValue({
        response: { data: { message: 'Listing not found' } },
      });

      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Listing not found', 'error');
      });
    });
  });

  describe('Form Pre-filling', () => {
    it('should pre-fill form with existing listing data', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toHaveValue('Pizza');
        expect(screen.getByTestId('description-input')).toHaveValue('Delicious leftover pizza');
        expect(screen.getByTestId('quantity-input')).toHaveValue(10);
        expect(screen.getByTestId('location-input')).toHaveValue('Student Center');
        expect(screen.getByTestId('food-type-select')).toHaveValue('Prepared Meal');
        expect(screen.getByTestId('status-select')).toHaveValue('active');
      });
    });

    it('should pre-fill dietary tags from existing listing', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        const vegetarianCheckbox = screen.getByTestId('dietary-tag-Vegetarian') as HTMLInputElement;
        expect(vegetarianCheckbox.checked).toBe(true);
      });
    });

    it('should pre-fill pickup window times', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('pickup-start-input')).toHaveValue('2025-03-15T14:00');
        expect(screen.getByTestId('pickup-end-input')).toHaveValue('2025-03-15T16:00');
      });
    });
  });

  describe('Form Rendering', () => {
    it('should render all form fields after loading', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('description-input')).toBeInTheDocument();
        expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
        expect(screen.getByTestId('location-input')).toBeInTheDocument();
        expect(screen.getByTestId('food-type-select')).toBeInTheDocument();
        expect(screen.getByTestId('status-select')).toBeInTheDocument();
        expect(screen.getByTestId('pickup-start-input')).toBeInTheDocument();
        expect(screen.getByTestId('pickup-end-input')).toBeInTheDocument();
      });
    });

    it('should render dietary tag checkboxes', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('dietary-tag-Vegetarian')).toBeInTheDocument();
        expect(screen.getByTestId('dietary-tag-Vegan')).toBeInTheDocument();
        expect(screen.getByTestId('dietary-tag-Gluten-Free')).toBeInTheDocument();
      });
    });

    it('should render submit and cancel buttons', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should prevent submission with empty required fields', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
      });

      // Clear required field
      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: '' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).not.toHaveBeenCalled();
      });
    });

    it('should prevent submission when quantity is less than 1', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '0' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).not.toHaveBeenCalled();
      });
    });

    it('should prevent submission when pickup end time is before start time', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('pickup-start-input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('pickup-start-input'), { target: { value: '2025-03-15T16:00' } });
      fireEvent.change(screen.getByTestId('pickup-end-input'), { target: { value: '2025-03-15T14:00' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).not.toHaveBeenCalled();
      });
    });
  });

  describe('Dietary Tags', () => {
    it('should add dietary tag when checkbox is checked', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('dietary-tag-Vegan')).toBeInTheDocument();
      });

      const veganCheckbox = screen.getByTestId('dietary-tag-Vegan') as HTMLInputElement;
      fireEvent.click(veganCheckbox);

      expect(veganCheckbox.checked).toBe(true);
    });

    it('should remove dietary tag when checkbox is unchecked', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('dietary-tag-Vegetarian')).toBeInTheDocument();
      });

      const vegetarianCheckbox = screen.getByTestId('dietary-tag-Vegetarian') as HTMLInputElement;
      expect(vegetarianCheckbox.checked).toBe(true);

      fireEvent.click(vegetarianCheckbox);
      expect(vegetarianCheckbox.checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with updated data', async () => {
      (listingsService.updateListing as any).mockResolvedValue({
        listing_id: '123',
      });

      const onSuccess = vi.fn();
      render(<EditListingForm listingId="123" onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: 'Updated Pizza' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).toHaveBeenCalledWith('123', expect.objectContaining({
          food_name: 'Updated Pizza',
        }));
        expect(mockShowToast).toHaveBeenCalledWith('Listing updated successfully!', 'success');
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should display error message on submission failure', async () => {
      (listingsService.updateListing as any).mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });

      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: 'Updated Pizza' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Server error', 'error');
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      render(<EditListingForm listingId="123" onCancel={onCancel} />);

      await waitFor(() => {
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should disable form fields while submitting', async () => {
      (listingsService.updateListing as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
      );

      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: 'Updated Pizza' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Status Field', () => {
    it('should allow changing listing status', async () => {
      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('status-select')).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId('status-select') as HTMLSelectElement;
      fireEvent.change(statusSelect, { target: { value: 'completed' } });

      expect(statusSelect.value).toBe('completed');
    });

    it('should submit with updated status', async () => {
      (listingsService.updateListing as any).mockResolvedValue({
        listing_id: '123',
      });

      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('status-select')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'completed' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).toHaveBeenCalledWith('123', expect.objectContaining({
          status: 'completed',
        }));
      });
    });
  });

  describe('Error Clearing', () => {
    it('should allow submission after fixing validation errors', async () => {
      (listingsService.updateListing as any).mockResolvedValue({
        listing_id: '123',
      });

      render(<EditListingForm listingId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('food-name-input')).toBeInTheDocument();
      });

      // Clear required field to trigger error
      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: '' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Service should not be called when validation fails
      await waitFor(() => {
        expect(listingsService.updateListing).not.toHaveBeenCalled();
      });

      // Now fix the field
      fireEvent.change(screen.getByTestId('food-name-input'), { target: { value: 'New Pizza' } });

      // Submit again - should succeed
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(listingsService.updateListing).toHaveBeenCalled();
      });
    });
  });
});
