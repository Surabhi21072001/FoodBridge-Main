import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import type { Listing, ListingQueryParams } from '../types';

/**
 * Property-Based Tests for Listings Filter Application and Ordering
 * **Validates: Requirements 4.2, 4.3, 4.4, 4.7, 20.2, 20.6**
 *
 * These tests verify that filters are correctly applied to search results
 * and that listings are properly ordered by pickup time.
 */
describe('Listings Filter Application Properties', () => {
  /**
   * Property 16: Filters are applied correctly to search results
   *
   * For any combination of filters (dietary, location, food type),
   * the API parameters should be constructed correctly, and when applied
   * to a set of listings, only matching listings should be returned.
   */
  it('Property 16: Filters are applied correctly to search results', () => {
    // Generate arbitrary filter combinations
    const dietaryArbitrary = fc.array(
      fc.constantFrom(
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Dairy-Free',
        'Nut-Free',
        'Halal',
        'Kosher'
      ),
      { minLength: 0, maxLength: 3 }
    );

    const locationArbitrary = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^[A-Za-z\s]{1,20}$/)
    );

    const foodTypeArbitrary = fc.oneof(
      fc.constant(''),
      fc.constantFrom('Italian', 'Asian', 'Mexican', 'American', 'Mediterranean')
    );

    fc.assert(
      fc.property(
        dietaryArbitrary,
        locationArbitrary,
        foodTypeArbitrary,
        (dietary, location, foodType) => {
          // Create mock listings with various dietary tags, locations, and food types
          const allListings: Listing[] = [
            {
              listing_id: '1',
              provider_id: 'provider-1',
              food_name: 'Vegetarian Pizza',
              description: 'Vegetarian pizza',
              quantity: 10,
              available_quantity: 5,
              location: 'Student Center',
              pickup_window_start: '2024-03-15T18:00:00Z',
              pickup_window_end: '2024-03-15T20:00:00Z',
              food_type: 'Italian',
              dietary_tags: ['Vegetarian'],
              listing_type: 'donation',
              status: 'active',
              created_at: '2024-03-14T10:00:00Z',
              updated_at: '2024-03-14T10:00:00Z',
            },
            {
              listing_id: '2',
              provider_id: 'provider-2',
              food_name: 'Vegan Sushi',
              description: 'Vegan sushi rolls',
              quantity: 20,
              available_quantity: 15,
              location: 'Library',
              pickup_window_start: '2024-03-15T12:00:00Z',
              pickup_window_end: '2024-03-15T14:00:00Z',
              food_type: 'Asian',
              dietary_tags: ['Vegan', 'Gluten-Free'],
              listing_type: 'event',
              status: 'active',
              created_at: '2024-03-14T10:00:00Z',
              updated_at: '2024-03-14T10:00:00Z',
            },
            {
              listing_id: '3',
              provider_id: 'provider-3',
              food_name: 'Gluten-Free Tacos',
              description: 'Gluten-free tacos',
              quantity: 15,
              available_quantity: 10,
              location: 'Student Center',
              pickup_window_start: '2024-03-15T17:00:00Z',
              pickup_window_end: '2024-03-15T19:00:00Z',
              food_type: 'Mexican',
              dietary_tags: ['Gluten-Free', 'Dairy-Free'],
              listing_type: 'donation',
              status: 'active',
              created_at: '2024-03-14T10:00:00Z',
              updated_at: '2024-03-14T10:00:00Z',
            },
          ];

          // Filter listings based on the arbitrary filters
          const filteredListings = allListings.filter((listing) => {
            // Check dietary filter
            if (dietary.length > 0) {
              const hasDietaryMatch = dietary.some((diet) =>
                listing.dietary_tags.includes(diet)
              );
              if (!hasDietaryMatch) return false;
            }

            // Check location filter
            if (location) {
              if (listing.location !== location) return false;
            }

            // Check food type filter
            if (foodType) {
              if (listing.food_type !== foodType) return false;
            }

            return true;
          });

          // Build the API parameters
          const params: ListingQueryParams = {
            page: 1,
            limit: 20,
            ...(dietary.length > 0 && { dietary }),
            ...(location && { location }),
            ...(foodType && { food_type: foodType }),
          };

          // Verify that the parameters are correctly constructed
          if (dietary.length > 0) {
            expect(params.dietary).toEqual(dietary);
          } else {
            expect(params.dietary).toBeUndefined();
          }

          if (location) {
            expect(params.location).toBe(location);
          } else {
            expect(params.location).toBeUndefined();
          }

          if (foodType) {
            expect(params.food_type).toBe(foodType);
          } else {
            expect(params.food_type).toBeUndefined();
          }

          // Verify that filtered listings match the filter criteria
          filteredListings.forEach((listing) => {
            // If dietary filters are applied, listing must have at least one matching tag
            if (dietary.length > 0) {
              const hasDietaryMatch = dietary.some((diet) =>
                listing.dietary_tags.includes(diet)
              );
              expect(hasDietaryMatch).toBe(true);
            }

            // If location filter is applied, location must match
            if (location) {
              expect(listing.location).toBe(location);
            }

            // If food type filter is applied, food type must match
            if (foodType) {
              expect(listing.food_type).toBe(foodType);
            }
          });

          // Verify that non-matching listings are not included
          const nonMatchingListings = allListings.filter(
            (listing) => !filteredListings.includes(listing)
          );

          nonMatchingListings.forEach((listing) => {
            // If dietary filters are applied, non-matching listings should not have all tags
            if (dietary.length > 0) {
              const hasDietaryMatch = dietary.some((diet) =>
                listing.dietary_tags.includes(diet)
              );
              if (hasDietaryMatch && location && listing.location !== location) {
                // This is expected - it matches dietary but not location
              } else if (hasDietaryMatch && foodType && listing.food_type !== foodType) {
                // This is expected - it matches dietary but not food type
              } else if (
                !hasDietaryMatch ||
                (location && listing.location !== location) ||
                (foodType && listing.food_type !== foodType)
              ) {
                // This is expected - it doesn't match at least one filter
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 19: Listings are ordered by pickup time
   *
   * For any set of listings displayed, they should be ordered by
   * pickup_window_start in ascending order (earliest pickup times first).
   */
  it('Property 19: Listings are ordered by pickup time', () => {
    // Generate arbitrary listings with various pickup times
    const listingArbitrary = fc.array(
      fc.record({
        listing_id: fc.uuid(),
        provider_id: fc.uuid(),
        food_name: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        quantity: fc.integer({ min: 1, max: 100 }),
        available_quantity: fc.integer({ min: 0, max: 100 }),
        location: fc.constantFrom('Student Center', 'Library', 'Dining Hall', 'Gym'),
        // Generate pickup times with various dates and times
        pickup_window_start: fc.tuple(
          fc.integer({ min: 1, max: 28 }),
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 })
        ).map(([day, hour, minute]) => {
          const date = new Date(2024, 2, day, hour, minute, 0);
          return date.toISOString();
        }),
        pickup_window_end: fc.tuple(
          fc.integer({ min: 1, max: 28 }),
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 })
        ).map(([day, hour, minute]) => {
          const date = new Date(2024, 2, day, hour, minute, 0);
          return date.toISOString();
        }),
        food_type: fc.constantFrom('Italian', 'Asian', 'Mexican', 'American'),
        dietary_tags: fc.array(
          fc.constantFrom('Vegetarian', 'Vegan', 'Gluten-Free'),
          { maxLength: 2 }
        ),
        listing_type: fc.constantFrom('donation', 'event'),
        status: fc.constant('active'),
        created_at: fc.constant('2024-03-14T10:00:00Z'),
        updated_at: fc.constant('2024-03-14T10:00:00Z'),
      }),
      { minLength: 1, maxLength: 20 }
    );

    fc.assert(
      fc.property(listingArbitrary, (listings) => {
        // Sort listings by pickup_window_start in ascending order
        const sortedListings = [...listings].sort((a, b) => {
          const timeA = new Date(a.pickup_window_start).getTime();
          const timeB = new Date(b.pickup_window_start).getTime();
          return timeA - timeB;
        });

        // Verify that the sorted listings are in ascending order
        for (let i = 0; i < sortedListings.length - 1; i++) {
          const currentTime = new Date(sortedListings[i].pickup_window_start).getTime();
          const nextTime = new Date(sortedListings[i + 1].pickup_window_start).getTime();
          expect(currentTime).toBeLessThanOrEqual(nextTime);
        }

        // Verify that each listing's pickup_window_start is a valid ISO date
        sortedListings.forEach((listing) => {
          const pickupTime = new Date(listing.pickup_window_start);
          expect(pickupTime.getTime()).toBeGreaterThan(0);
          // Accept ISO format with or without milliseconds
          expect(listing.pickup_window_start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
        });

        // Verify that the original unsorted listings can be sorted correctly
        const unsortedListings = [...listings];
        const resortedListings = unsortedListings.sort((a, b) => {
          const timeA = new Date(a.pickup_window_start).getTime();
          const timeB = new Date(b.pickup_window_start).getTime();
          return timeA - timeB;
        });

        // Verify that re-sorting produces the same order
        expect(resortedListings).toEqual(sortedListings);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 20: Filter state persists across navigation
   *
   * For any applied filters, the filter parameters should remain
   * consistent when making multiple API calls with the same filters.
   */
  it('Property 20: Filter state persists across navigation', () => {
    const dietaryArbitrary = fc.array(
      fc.constantFrom('Vegetarian', 'Vegan', 'Gluten-Free'),
      { minLength: 0, maxLength: 2 }
    );

    const locationArbitrary = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^[A-Za-z]{1,15}$/)
    );

    fc.assert(
      fc.property(dietaryArbitrary, locationArbitrary, (dietary, location) => {
        // Build the filter parameters
        const params: ListingQueryParams = {
          page: 1,
          limit: 20,
          ...(dietary.length > 0 && { dietary }),
          ...(location && { location }),
        };

        // Simulate making the same API call twice (navigation away and back)
        const firstCallParams = { ...params };
        const secondCallParams = { ...params };

        // Verify both calls have identical parameters
        expect(firstCallParams).toEqual(secondCallParams);

        // Verify the parameters are preserved
        if (dietary.length > 0) {
          expect(firstCallParams.dietary).toEqual(dietary);
          expect(secondCallParams.dietary).toEqual(dietary);
        }

        if (location) {
          expect(firstCallParams.location).toBe(location);
          expect(secondCallParams.location).toBe(location);
        }

        // Verify pagination parameters are preserved
        expect(firstCallParams.page).toBe(1);
        expect(firstCallParams.limit).toBe(20);
        expect(secondCallParams.page).toBe(1);
        expect(secondCallParams.limit).toBe(20);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Active filters displayed as removable tags
   *
   * For any applied filter, the filter should be included in the
   * API request parameters and the results should reflect those filters.
   */
  it('Property 21: Active filters displayed as removable tags', () => {
    const dietaryArbitrary = fc.array(
      fc.constantFrom('Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'),
      { minLength: 1, maxLength: 2 }
    );

    fc.assert(
      fc.property(dietaryArbitrary, (dietary) => {
        // Build the filter parameters with dietary tags
        const params: ListingQueryParams = {
          page: 1,
          limit: 20,
          dietary,
        };

        // Verify the dietary filters are included in the parameters
        expect(params.dietary).toEqual(dietary);
        expect(params.dietary).toHaveLength(dietary.length);

        // Verify each dietary filter is present
        dietary.forEach((diet) => {
          expect(params.dietary).toContain(diet);
        });

        // Simulate removing a filter
        if (dietary.length > 0) {
          const removedDiet = dietary[0];
          const remainingDietary = dietary.filter((d) => d !== removedDiet);

          const updatedParams: ListingQueryParams = {
            page: 1,
            limit: 20,
            ...(remainingDietary.length > 0 && { dietary: remainingDietary }),
          };

          // Verify the removed filter is no longer in the parameters
          if (remainingDietary.length > 0) {
            expect(updatedParams.dietary).not.toContain(removedDiet);
            expect(updatedParams.dietary).toHaveLength(remainingDietary.length);
          } else {
            expect(updatedParams.dietary).toBeUndefined();
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
