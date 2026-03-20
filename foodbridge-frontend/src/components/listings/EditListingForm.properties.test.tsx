import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import EditListingForm from './EditListingForm';
import listingsService from '../../services/listingsService';
import * as ToastHook from '../../hooks/useToast';
import type { Listing } from '../../types/listings';

// Mock the services
vi.mock('../../services/listingsService');
vi.mock('../../hooks/useToast');

const mockShowToast = vi.fn();

/**
 * Property-Based Tests for EditListingForm Component
 * **Validates: Requirements 11.5**
 */
describe('EditListingForm Properties', () => {
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
   * Property 56: Edit form is pre-filled with existing data
   *
   * For any existing listing with arbitrary valid data, when the EditListingForm
   * is rendered with that listing's ID, all form fields should be pre-filled with
   * the exact values from the fetched listing data.
   *
   * Validates: Requirements 11.5
   */
  it(
    'Property 56: Edit form is pre-filled with existing data',
    { timeout: 120000 },
    async () => {
      // Generate arbitrary valid listing data with simpler patterns
      const foodNameArbitrary = fc.stringMatching(/^[A-Za-z]{3,15}$/);
      const descriptionArbitrary = fc.stringMatching(/^[A-Za-z]{10,30}$/);
      const quantityArbitrary = fc.integer({ min: 1, max: 20 });
      const locationArbitrary = fc.stringMatching(/^[A-Za-z]{3,15}$/);
      const foodTypeArbitrary = fc.constantFrom('Prepared Meal', 'Bakery', 'Produce');
      const statusArbitrary = fc.constantFrom('active', 'expired');
      const dietaryTagsArbitrary = fc.subarray(
        ['Vegetarian', 'Vegan'],
        { minLength: 0, maxLength: 1 }
      );

      await fc.assert(
        fc.asyncProperty(
          foodNameArbitrary,
          descriptionArbitrary,
          quantityArbitrary,
          locationArbitrary,
          foodTypeArbitrary,
          statusArbitrary,
          dietaryTagsArbitrary,
          async (
            foodName,
            description,
            quantity,
            location,
            foodType,
            status,
            dietaryTags
          ) => {
            cleanup();
            vi.clearAllMocks();
            (ToastHook.default as any).mockReturnValue({
              showToast: mockShowToast,
            });

            // Generate valid pickup window times
            const pickupStart = new Date();
            pickupStart.setHours(pickupStart.getHours() + 2);
            const pickupStartString = pickupStart.toISOString().slice(0, 16);

            const pickupEnd = new Date();
            pickupEnd.setHours(pickupEnd.getHours() + 3);
            const pickupEndString = pickupEnd.toISOString().slice(0, 16);

            // Create mock listing with generated data
            const mockListing: Listing = {
              listing_id: 'test-listing-123',
              provider_id: 'provider-1',
              food_name: foodName,
              description: description,
              quantity: quantity,
              available_quantity: quantity - 1,
              location: location,
              pickup_window_start: pickupStartString,
              pickup_window_end: pickupEndString,
              food_type: foodType,
              dietary_tags: dietaryTags,
              listing_type: 'donation',
              status: status as 'active' | 'expired' | 'completed' | 'unavailable',
              created_at: '2025-03-13T10:00:00Z',
              updated_at: '2025-03-13T10:00:00Z',
            };

            // Mock the service to return the listing
            (listingsService.getListingById as any).mockResolvedValue(mockListing);

            // Render the form
            render(<EditListingForm listingId="test-listing-123" />);

            // Wait for form to load and verify all fields are pre-filled
            await waitFor(() => {
              // Verify food name is pre-filled
              const foodNameInput = screen.getByTestId('food-name-input') as HTMLInputElement;
              expect(foodNameInput.value).toBe(foodName);

              // Verify description is pre-filled
              const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;
              expect(descriptionInput.value).toBe(description);

              // Verify quantity is pre-filled
              const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
              expect(quantityInput.value).toBe(quantity.toString());

              // Verify location is pre-filled
              const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
              expect(locationInput.value).toBe(location);

              // Verify food type is pre-filled
              const foodTypeSelect = screen.getByTestId('food-type-select') as HTMLSelectElement;
              expect(foodTypeSelect.value).toBe(foodType);

              // Verify status is pre-filled
              const statusSelect = screen.getByTestId('status-select') as HTMLSelectElement;
              expect(statusSelect.value).toBe(status);

              // Verify pickup window times are pre-filled
              const pickupStartInput = screen.getByTestId('pickup-start-input') as HTMLInputElement;
              expect(pickupStartInput.value).toBe(pickupStartString);

              const pickupEndInput = screen.getByTestId('pickup-end-input') as HTMLInputElement;
              expect(pickupEndInput.value).toBe(pickupEndString);

              // Verify dietary tags are pre-filled
              for (const tag of dietaryTags) {
                const checkbox = screen.getByTestId(`dietary-tag-${tag}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(true);
              }

              // Verify non-selected dietary tags are unchecked
              const allDietaryTags = [
                'Vegetarian',
                'Vegan',
                'Gluten-Free',
                'Dairy-Free',
                'Nut-Free',
                'Halal',
                'Kosher',
              ];
              for (const tag of allDietaryTags) {
                if (!dietaryTags.includes(tag)) {
                  const checkbox = screen.getByTestId(`dietary-tag-${tag}`) as HTMLInputElement;
                  expect(checkbox.checked).toBe(false);
                }
              }
            }, { timeout: 3000 });

            // Verify the service was called with the correct listing ID
            expect(listingsService.getListingById).toHaveBeenCalledWith('test-listing-123');
          }
        ),
        { numRuns: 5 }
      );
    }
  );

  /**
   * Property 56 Extended: Edit form pre-fill with dietary tags
   *
   * For any existing listing with dietary tags selected,
   * when the EditListingForm is rendered, the dietary tag checkboxes
   * should be pre-filled correctly.
   *
   * Validates: Requirements 11.5
   */
  it(
    'Property 56 Extended: Edit form pre-fill with dietary tags',
    { timeout: 120000 },
    async () => {
      const dietaryTagsArbitrary = fc.subarray(
        ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
        { minLength: 1, maxLength: 2 }
      );

      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Za-z]{3,15}$/),
          fc.stringMatching(/^[A-Za-z]{10,30}$/),
          fc.integer({ min: 1, max: 20 }),
          fc.stringMatching(/^[A-Za-z]{3,15}$/),
          dietaryTagsArbitrary,
          async (foodName, description, quantity, location, dietaryTags) => {
            cleanup();
            vi.clearAllMocks();
            (ToastHook.default as any).mockReturnValue({
              showToast: mockShowToast,
            });

            // Generate valid pickup window times
            const pickupStart = new Date();
            pickupStart.setHours(pickupStart.getHours() + 2);
            const pickupStartString = pickupStart.toISOString().slice(0, 16);

            const pickupEnd = new Date();
            pickupEnd.setHours(pickupEnd.getHours() + 3);
            const pickupEndString = pickupEnd.toISOString().slice(0, 16);

            // Create mock listing with dietary tags
            const mockListing: Listing = {
              listing_id: 'test-listing-456',
              provider_id: 'provider-1',
              food_name: foodName,
              description: description,
              quantity: quantity,
              available_quantity: quantity - 1,
              location: location,
              pickup_window_start: pickupStartString,
              pickup_window_end: pickupEndString,
              food_type: 'Prepared Meal',
              dietary_tags: dietaryTags,
              listing_type: 'donation',
              status: 'active',
              created_at: '2025-03-13T10:00:00Z',
              updated_at: '2025-03-13T10:00:00Z',
            };

            // Mock the service to return the listing
            (listingsService.getListingById as any).mockResolvedValue(mockListing);

            // Render the form
            render(<EditListingForm listingId="test-listing-456" />);

            // Wait for form to load and verify dietary tags are checked
            await waitFor(() => {
              for (const tag of dietaryTags) {
                const checkbox = screen.getByTestId(`dietary-tag-${tag}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(true);
              }
            }, { timeout: 3000 });

            // Verify the service was called
            expect(listingsService.getListingById).toHaveBeenCalledWith('test-listing-456');
          }
        ),
        { numRuns: 5 }
      );
    }
  );

  /**
   * Property 56 Extended: Edit form pre-fill with no dietary tags
   *
   * For any existing listing with no dietary tags selected,
   * when the EditListingForm is rendered, all dietary tag checkboxes
   * should be pre-filled as unchecked.
   *
   * Validates: Requirements 11.5
   */
  it(
    'Property 56 Extended: Edit form pre-fill with no dietary tags',
    { timeout: 120000 },
    async () => {
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
          fc.stringMatching(/^[A-Za-z]{3,15}$/),
          fc.stringMatching(/^[A-Za-z]{10,30}$/),
          fc.integer({ min: 1, max: 20 }),
          fc.stringMatching(/^[A-Za-z]{3,15}$/),
          async (foodName, description, quantity, location) => {
            cleanup();
            vi.clearAllMocks();
            (ToastHook.default as any).mockReturnValue({
              showToast: mockShowToast,
            });

            // Generate valid pickup window times
            const pickupStart = new Date();
            pickupStart.setHours(pickupStart.getHours() + 2);
            const pickupStartString = pickupStart.toISOString().slice(0, 16);

            const pickupEnd = new Date();
            pickupEnd.setHours(pickupEnd.getHours() + 3);
            const pickupEndString = pickupEnd.toISOString().slice(0, 16);

            // Create mock listing with no dietary tags
            const mockListing: Listing = {
              listing_id: 'test-listing-789',
              provider_id: 'provider-1',
              food_name: foodName,
              description: description,
              quantity: quantity,
              available_quantity: quantity - 1,
              location: location,
              pickup_window_start: pickupStartString,
              pickup_window_end: pickupEndString,
              food_type: 'Produce',
              dietary_tags: [],
              listing_type: 'donation',
              status: 'active',
              created_at: '2025-03-13T10:00:00Z',
              updated_at: '2025-03-13T10:00:00Z',
            };

            // Mock the service to return the listing
            (listingsService.getListingById as any).mockResolvedValue(mockListing);

            // Render the form
            render(<EditListingForm listingId="test-listing-789" />);

            // Wait for form to load and verify all dietary tags are unchecked
            await waitFor(() => {
              for (const tag of allDietaryTags) {
                const checkbox = screen.getByTestId(`dietary-tag-${tag}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(false);
              }
            }, { timeout: 3000 });

            // Verify the service was called
            expect(listingsService.getListingById).toHaveBeenCalledWith('test-listing-789');
          }
        ),
        { numRuns: 5 }
      );
    }
  );
});
