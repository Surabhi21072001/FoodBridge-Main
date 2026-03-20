import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import ListingFilters from './ListingFilters';
import type { FilterState } from '../../types/listings';

/**
 * Property-Based Tests for ListingFilters Component
 * **Validates: Requirements 4.2, 4.3, 4.4, 20.2, 20.6**
 */

describe('ListingFilters Properties', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 16: Filters are applied correctly to search results
   *
   * For any combination of filters (dietary, location, food type),
   * the component should display them correctly as active tags.
   */
  it('Property 16: Filters are applied correctly to search results', () => {
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
      { minLength: 0, maxLength: 2 }
    );

    const locationArbitrary = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^[A-Za-z]{1,15}$/)
    );

    const foodTypeArbitrary = fc.oneof(
      fc.constant(''),
      fc.constantFrom('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage')
    );

    fc.assert(
      fc.property(
        dietaryArbitrary,
        locationArbitrary,
        foodTypeArbitrary,
        (dietary, location, foodType) => {
          cleanup();
          const mockOnChange = vi.fn();
          const filters: FilterState = {
            dietary,
            location,
            food_type: foodType,
          };

          render(
            <ListingFilters filters={filters} onChange={mockOnChange} />
          );

          // Verify all dietary filters are displayed as active tags
          for (const diet of dietary) {
            const tags = screen.queryAllByTestId(`active-dietary-tag-${diet}`);
            expect(tags.length).toBeGreaterThan(0);
          }

          // Verify location filter is displayed as active tag
          if (location) {
            const locationTags = screen.queryAllByTestId('active-location-tag');
            expect(locationTags.length).toBeGreaterThan(0);
            expect(locationTags[0]).toHaveTextContent(location);
          }

          // Verify food type filter is displayed as active tag
          if (foodType) {
            const foodTypeTags = screen.queryAllByTestId('active-food-type-tag');
            expect(foodTypeTags.length).toBeGreaterThan(0);
            expect(foodTypeTags[0]).toHaveTextContent(foodType);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 20: Filter state persists across navigation
   *
   * For any applied filters, the filter state should be preserved
   * when the component is re-rendered with the same filter values.
   */
  it('Property 20: Filter state persists across navigation', () => {
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
      { minLength: 0, maxLength: 2 }
    );

    const locationArbitrary = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^[A-Za-z]{1,15}$/)
    );

    const foodTypeArbitrary = fc.oneof(
      fc.constant(''),
      fc.constantFrom('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage')
    );

    fc.assert(
      fc.property(
        dietaryArbitrary,
        locationArbitrary,
        foodTypeArbitrary,
        (dietary, location, foodType) => {
          cleanup();
          const mockOnChange = vi.fn();
          const filters: FilterState = {
            dietary,
            location,
            food_type: foodType,
          };

          const { rerender } = render(
            <ListingFilters filters={filters} onChange={mockOnChange} />
          );

          // Verify all filters are displayed
          for (const diet of dietary) {
            const tags = screen.queryAllByTestId(`active-dietary-tag-${diet}`);
            expect(tags.length).toBeGreaterThan(0);
          }

          if (location) {
            const locationTags = screen.queryAllByTestId('active-location-tag');
            expect(locationTags.length).toBeGreaterThan(0);
          }

          if (foodType) {
            const foodTypeTags = screen.queryAllByTestId('active-food-type-tag');
            expect(foodTypeTags.length).toBeGreaterThan(0);
          }

          // Re-render with same filters (simulating navigation)
          rerender(<ListingFilters filters={filters} onChange={mockOnChange} />);

          // Verify filters are still displayed after re-render
          for (const diet of dietary) {
            const tags = screen.queryAllByTestId(`active-dietary-tag-${diet}`);
            expect(tags.length).toBeGreaterThan(0);
          }

          if (location) {
            const locationTags = screen.queryAllByTestId('active-location-tag');
            expect(locationTags.length).toBeGreaterThan(0);
          }

          if (foodType) {
            const foodTypeTags = screen.queryAllByTestId('active-food-type-tag');
            expect(foodTypeTags.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Active filters displayed as removable tags
   *
   * For any applied filter, it should be displayed as a removable tag.
   */
  it('Property 21: Active filters displayed as removable tags', () => {
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
      { minLength: 1, maxLength: 2 }
    );

    fc.assert(
      fc.property(dietaryArbitrary, (dietary) => {
        cleanup();
        const mockOnChange = vi.fn();
        const filters: FilterState = {
          dietary,
          location: '',
          food_type: '',
        };

        render(<ListingFilters filters={filters} onChange={mockOnChange} />);

        // Verify each dietary filter is displayed as a removable tag
        for (const diet of dietary) {
          const tags = screen.queryAllByTestId(`active-dietary-tag-${diet}`);
          expect(tags.length).toBeGreaterThan(0);

          // Verify remove button exists
          const removeButtons = screen.queryAllByTestId(`remove-dietary-${diet}`);
          expect(removeButtons.length).toBeGreaterThan(0);
          expect(removeButtons[0]).toHaveAttribute('aria-label', `Remove ${diet} filter`);
        }
      }),
      { numRuns: 50 }
    );
  });
});
