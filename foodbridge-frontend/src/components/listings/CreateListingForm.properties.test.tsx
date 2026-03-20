import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import CreateListingForm from './CreateListingForm';
import listingsService from '../../services/listingsService';
import * as ToastHook from '../../hooks/useToast';

// Mock the services
vi.mock('../../services/listingsService');
vi.mock('../../hooks/useToast');

const mockShowToast = vi.fn();

/**
 * Property-Based Tests for CreateListingForm Component
 * **Validates: Requirements 11.3**
 */
describe('CreateListingForm Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ToastHook.default as any).mockReturnValue({
      showToast: mockShowToast,
    });
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 54: Valid listing creation displays success
   *
   * For any valid listing form submission by a provider, the listing data
   * should be sent to the backend API and a success message should be displayed.
   *
   * Validates: Requirements 11.3
   */
  it('Property 54: Valid listing creation displays success', async () => {
    // Generate valid listing data using fast-check
    const foodNameArbitrary = fc.stringMatching(/^[A-Za-z]{3,20}$/);
    const descriptionArbitrary = fc.stringMatching(/^[A-Za-z]{10,50}$/);
    const quantityArbitrary = fc.integer({ min: 1, max: 50 });
    const locationArbitrary = fc.stringMatching(/^[A-Za-z0-9]{3,20}$/);
    const foodTypeArbitrary = fc.constantFrom(
      'Prepared Meal',
      'Bakery',
      'Produce',
      'Dairy'
    );
    const listingTypeArbitrary = fc.constantFrom('donation', 'event', 'dining_deal');

    await fc.assert(
      fc.asyncProperty(
        foodNameArbitrary,
        descriptionArbitrary,
        quantityArbitrary,
        locationArbitrary,
        foodTypeArbitrary,
        listingTypeArbitrary,
        async (
          foodName,
          description,
          quantity,
          location,
          foodType,
          listingType
        ) => {
          cleanup();
          vi.clearAllMocks();
          (ToastHook.default as any).mockReturnValue({
            showToast: mockShowToast,
          });

          // Mock successful API response
          (listingsService.createListing as any).mockResolvedValue({
            listing_id: 'test-123',
            food_name: foodName,
            description,
            quantity,
            location,
            food_type: foodType,
            listing_type: listingType,
            dietary_tags: [],
          });

          const onSuccess = vi.fn();
          render(<CreateListingForm onSuccess={onSuccess} />);

          // Generate future dates for pickup window
          const futureStart = new Date();
          futureStart.setHours(futureStart.getHours() + 2);
          const startString = futureStart.toISOString().slice(0, 16);

          const futureEnd = new Date();
          futureEnd.setHours(futureEnd.getHours() + 3);
          const endString = futureEnd.toISOString().slice(0, 16);

          // Fill in form fields using fireEvent for simpler interaction
          const foodNameInput = screen.getByTestId('food-name-input') as HTMLInputElement;
          const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;
          const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
          const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
          const foodTypeSelect = screen.getByTestId('food-type-select') as HTMLSelectElement;
          const listingTypeSelect = screen.getByTestId('listing-type-select') as HTMLSelectElement;
          const pickupStartInput = screen.getByTestId('pickup-start-input') as HTMLInputElement;
          const pickupEndInput = screen.getByTestId('pickup-end-input') as HTMLInputElement;

          fireEvent.change(foodNameInput, { target: { value: foodName } });
          fireEvent.change(descriptionInput, { target: { value: description } });
          fireEvent.change(quantityInput, { target: { value: quantity.toString() } });
          fireEvent.change(locationInput, { target: { value: location } });
          fireEvent.change(foodTypeSelect, { target: { value: foodType } });
          fireEvent.change(listingTypeSelect, { target: { value: listingType } });
          fireEvent.change(pickupStartInput, { target: { value: startString } });
          fireEvent.change(pickupEndInput, { target: { value: endString } });

          // Submit form
          const submitButton = screen.getByTestId('submit-button');
          fireEvent.click(submitButton);

          // Verify API was called with correct data
          await waitFor(() => {
            expect(listingsService.createListing).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Verify success toast was shown
          await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
              'Listing created successfully!',
              'success'
            );
          }, { timeout: 3000 });

          // Verify onSuccess callback was called
          await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 54 Extended: Valid listing creation with all dietary tags
   *
   * For any valid listing form submission with all possible dietary tags,
   * the listing data should be sent to the backend API and a success message
   * should be displayed.
   *
   * Validates: Requirements 11.3
   */
  it('Property 54 Extended: Valid listing creation with all dietary tags', async () => {
    const allDietaryTags = [
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Dairy-Free',
      'Nut-Free',
      'Halal',
      'Kosher',
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[A-Za-z]{3,20}$/),
        fc.stringMatching(/^[A-Za-z]{10,50}$/),
        fc.integer({ min: 1, max: 50 }),
        fc.stringMatching(/^[A-Za-z0-9]{3,20}$/),
        async (foodName, description, quantity, location) => {
          cleanup();
          vi.clearAllMocks();
          (ToastHook.default as any).mockReturnValue({
            showToast: mockShowToast,
          });

          // Mock successful API response
          (listingsService.createListing as any).mockResolvedValue({
            listing_id: 'test-456',
            food_name: foodName,
            description,
            quantity,
            location,
            food_type: 'Prepared Meal',
            listing_type: 'donation',
            dietary_tags: allDietaryTags,
          });

          const onSuccess = vi.fn();
          render(<CreateListingForm onSuccess={onSuccess} />);

          // Generate future dates
          const futureStart = new Date();
          futureStart.setHours(futureStart.getHours() + 2);
          const startString = futureStart.toISOString().slice(0, 16);

          const futureEnd = new Date();
          futureEnd.setHours(futureEnd.getHours() + 3);
          const endString = futureEnd.toISOString().slice(0, 16);

          // Fill in form fields
          const foodNameInput = screen.getByTestId('food-name-input') as HTMLInputElement;
          const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;
          const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
          const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
          const foodTypeSelect = screen.getByTestId('food-type-select') as HTMLSelectElement;
          const pickupStartInput = screen.getByTestId('pickup-start-input') as HTMLInputElement;
          const pickupEndInput = screen.getByTestId('pickup-end-input') as HTMLInputElement;

          fireEvent.change(foodNameInput, { target: { value: foodName } });
          fireEvent.change(descriptionInput, { target: { value: description } });
          fireEvent.change(quantityInput, { target: { value: quantity.toString() } });
          fireEvent.change(locationInput, { target: { value: location } });
          fireEvent.change(foodTypeSelect, { target: { value: 'Prepared Meal' } });
          fireEvent.change(pickupStartInput, { target: { value: startString } });
          fireEvent.change(pickupEndInput, { target: { value: endString } });

          // Select all dietary tags
          for (const tag of allDietaryTags) {
            const checkbox = screen.getByTestId(`dietary-tag-${tag}`) as HTMLInputElement;
            if (!checkbox.checked) {
              fireEvent.click(checkbox);
            }
          }

          // Submit form
          const submitButton = screen.getByTestId('submit-button');
          fireEvent.click(submitButton);

          // Verify API was called
          await waitFor(() => {
            expect(listingsService.createListing).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Verify success toast was shown
          await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
              'Listing created successfully!',
              'success'
            );
          }, { timeout: 3000 });

          // Verify onSuccess callback was called
          await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Property 54 Extended: Valid listing creation with different listing types
   *
   * For any valid listing form submission with different listing types
   * (donation, event, dining_deal), the listing data should be sent to the
   * backend API and a success message should be displayed.
   *
   * Validates: Requirements 11.3
   */
  it('Property 54 Extended: Valid listing creation with different listing types', async () => {
    const listingTypes = ['donation', 'event', 'dining_deal'];

    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[A-Za-z]{3,20}$/),
        fc.stringMatching(/^[A-Za-z]{10,50}$/),
        fc.integer({ min: 1, max: 50 }),
        fc.stringMatching(/^[A-Za-z0-9]{3,20}$/),
        fc.constantFrom(...listingTypes),
        async (foodName, description, quantity, location, listingType) => {
          cleanup();
          vi.clearAllMocks();
          (ToastHook.default as any).mockReturnValue({
            showToast: mockShowToast,
          });

          // Mock successful API response
          (listingsService.createListing as any).mockResolvedValue({
            listing_id: 'test-789',
            food_name: foodName,
            description,
            quantity,
            location,
            food_type: 'Prepared Meal',
            listing_type: listingType,
            dietary_tags: [],
          });

          const onSuccess = vi.fn();
          render(<CreateListingForm onSuccess={onSuccess} />);

          // Generate future dates
          const futureStart = new Date();
          futureStart.setHours(futureStart.getHours() + 2);
          const startString = futureStart.toISOString().slice(0, 16);

          const futureEnd = new Date();
          futureEnd.setHours(futureEnd.getHours() + 3);
          const endString = futureEnd.toISOString().slice(0, 16);

          // Fill in form fields
          const foodNameInput = screen.getByTestId('food-name-input') as HTMLInputElement;
          const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;
          const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
          const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
          const foodTypeSelect = screen.getByTestId('food-type-select') as HTMLSelectElement;
          const listingTypeSelect = screen.getByTestId('listing-type-select') as HTMLSelectElement;
          const pickupStartInput = screen.getByTestId('pickup-start-input') as HTMLInputElement;
          const pickupEndInput = screen.getByTestId('pickup-end-input') as HTMLInputElement;

          fireEvent.change(foodNameInput, { target: { value: foodName } });
          fireEvent.change(descriptionInput, { target: { value: description } });
          fireEvent.change(quantityInput, { target: { value: quantity.toString() } });
          fireEvent.change(locationInput, { target: { value: location } });
          fireEvent.change(foodTypeSelect, { target: { value: 'Prepared Meal' } });
          fireEvent.change(listingTypeSelect, { target: { value: listingType } });
          fireEvent.change(pickupStartInput, { target: { value: startString } });
          fireEvent.change(pickupEndInput, { target: { value: endString } });

          // Submit form
          const submitButton = screen.getByTestId('submit-button');
          fireEvent.click(submitButton);

          // Verify API was called
          await waitFor(() => {
            expect(listingsService.createListing).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Verify success toast was shown
          await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
              'Listing created successfully!',
              'success'
            );
          }, { timeout: 3000 });

          // Verify onSuccess callback was called
          await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      ),
      { numRuns: 15 }
    );
  });
});
