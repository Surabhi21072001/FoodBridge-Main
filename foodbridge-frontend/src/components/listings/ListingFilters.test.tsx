import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ListingFilters from './ListingFilters';
import type { FilterState } from '../../types/listings';

describe('ListingFilters Component', () => {
  const mockOnChange = vi.fn();

  const defaultFilters: FilterState = {
    dietary: [],
    location: '',
    food_type: '',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  afterEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the filters component', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByTestId('listing-filters')).toBeInTheDocument();
    });

    it('should render filter sections', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Food Type')).toBeInTheDocument();
    });

    it('should render all dietary options', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByTestId('dietary-checkbox-Vegetarian')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Vegan')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Gluten-Free')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Dairy-Free')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Nut-Free')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Halal')).toBeInTheDocument();
      expect(screen.getByTestId('dietary-checkbox-Kosher')).toBeInTheDocument();
    });

    it('should render all food type options', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByTestId('food-type-radio-Breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('food-type-radio-Lunch')).toBeInTheDocument();
      expect(screen.getByTestId('food-type-radio-Dinner')).toBeInTheDocument();
      expect(screen.getByTestId('food-type-radio-Snack')).toBeInTheDocument();
      expect(screen.getByTestId('food-type-radio-Dessert')).toBeInTheDocument();
      expect(screen.getByTestId('food-type-radio-Beverage')).toBeInTheDocument();
    });

    it('should render location input', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByTestId('location-input')).toBeInTheDocument();
      expect(screen.getByTestId('location-apply-button')).toBeInTheDocument();
    });
  });

  describe('Dietary Filter Interactions', () => {
    it('should toggle dietary filter when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const vegetarianCheckbox = screen.getByTestId('dietary-checkbox-Vegetarian');
      await user.click(vegetarianCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: ['Vegetarian'],
        location: '',
        food_type: '',
      });
    });

    it('should handle multiple dietary selections', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: ['Vegetarian'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const veganCheckbox = screen.getByTestId('dietary-checkbox-Vegan');
      await user.click(veganCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      });
    });

    it('should uncheck dietary filter when already selected', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const vegetarianCheckbox = screen.getByTestId('dietary-checkbox-Vegetarian');
      await user.click(vegetarianCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: ['Vegan'],
        location: '',
        food_type: '',
      });
    });

    it('should display checked state for selected dietary filters', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('dietary-checkbox-Vegetarian')).toBeChecked();
      expect(screen.getByTestId('dietary-checkbox-Vegan')).toBeChecked();
      expect(screen.getByTestId('dietary-checkbox-Gluten-Free')).not.toBeChecked();
    });
  });

  describe('Location Filter Interactions', () => {
    it('should update location input value', async () => {
      const user = userEvent.setup();
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
      await user.type(locationInput, 'Downtown');

      expect(locationInput.value).toBe('Downtown');
    });

    it('should apply location filter when apply button is clicked', async () => {
      const user = userEvent.setup();
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const locationInput = screen.getByTestId('location-input');
      await user.type(locationInput, 'Downtown');

      const applyButton = screen.getByTestId('location-apply-button');
      await user.click(applyButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: [],
        location: 'Downtown',
        food_type: '',
      });
    });

    it('should preserve location input when component re-renders', () => {
      const { rerender } = render(
        <ListingFilters filters={defaultFilters} onChange={mockOnChange} />
      );

      const locationInput = screen.getByTestId('location-input') as HTMLInputElement;
      fireEvent.change(locationInput, { target: { value: 'Downtown' } });

      expect(locationInput.value).toBe('Downtown');

      rerender(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      expect(locationInput.value).toBe('Downtown');
    });
  });

  describe('Food Type Filter Interactions', () => {
    it('should select food type when radio button is clicked', async () => {
      const user = userEvent.setup();
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const breakfastRadio = screen.getByTestId('food-type-radio-Breakfast');
      await user.click(breakfastRadio);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: [],
        location: '',
        food_type: 'Breakfast',
      });
    });

    it('should display checked state for selected food type', () => {
      const filters: FilterState = {
        dietary: [],
        location: '',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('food-type-radio-Lunch')).toBeChecked();
      expect(screen.getByTestId('food-type-radio-Breakfast')).not.toBeChecked();
    });
  });

  describe('Active Filters Display', () => {
    it('should not display active filters section when no filters are applied', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.queryByTestId('active-dietary-tag-Vegetarian')).not.toBeInTheDocument();
      expect(screen.queryByTestId('active-location-tag')).not.toBeInTheDocument();
      expect(screen.queryByTestId('active-food-type-tag')).not.toBeInTheDocument();
    });

    it('should display active dietary filter tags', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('active-dietary-tag-Vegetarian')).toBeInTheDocument();
      expect(screen.getByTestId('active-dietary-tag-Vegan')).toBeInTheDocument();
      expect(screen.getByTestId('active-dietary-tag-Vegetarian')).toHaveTextContent('Vegetarian');
      expect(screen.getByTestId('active-dietary-tag-Vegan')).toHaveTextContent('Vegan');
    });

    it('should display active location filter tag', () => {
      const filters: FilterState = {
        dietary: [],
        location: 'Downtown',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('active-location-tag')).toBeInTheDocument();
      expect(screen.getByTestId('active-location-tag')).toHaveTextContent('Downtown');
    });

    it('should display active food type filter tag', () => {
      const filters: FilterState = {
        dietary: [],
        location: '',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('active-food-type-tag')).toBeInTheDocument();
      const tag = screen.getByTestId('active-food-type-tag');
      expect(tag).toHaveTextContent('Lunch');
    });

    it('should remove dietary filter when tag close button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const removeButton = screen.getByTestId('remove-dietary-Vegetarian');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: ['Vegan'],
        location: '',
        food_type: '',
      });
    });

    it('should remove location filter when tag close button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: [],
        location: 'Downtown',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const removeButton = screen.getByTestId('remove-location');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: [],
        location: '',
        food_type: '',
      });
    });

    it('should remove food type filter when tag close button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: [],
        location: '',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const removeButton = screen.getByTestId('remove-food-type');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: [],
        location: '',
        food_type: '',
      });
    });
  });

  describe('Filter Count Badge', () => {
    it('should not display filter count badge when no filters are applied', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should display correct filter count for dietary filters', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display correct filter count for all filter types', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian'],
        location: 'Downtown',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should update filter count when filters change', () => {
      const { rerender } = render(
        <ListingFilters filters={defaultFilters} onChange={mockOnChange} />
      );

      expect(screen.queryByText('1')).not.toBeInTheDocument();

      const filters: FilterState = {
        dietary: ['Vegetarian'],
        location: '',
        food_type: '',
      };

      rerender(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Clear All Filters', () => {
    it('should not display clear all button when no filters are applied', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.queryByTestId('clear-all-filters')).not.toBeInTheDocument();
    });

    it('should display clear all button when filters are applied', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian'],
        location: '',
        food_type: '',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('clear-all-filters')).toBeInTheDocument();
    });

    it('should clear all filters when clear all button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Vegan'],
        location: 'Downtown',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      const clearAllButton = screen.getByTestId('clear-all-filters');
      await user.click(clearAllButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        dietary: [],
        location: '',
        food_type: '',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for dietary checkboxes', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const vegetarianCheckbox = screen.getByTestId('dietary-checkbox-Vegetarian');
      expect(vegetarianCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have proper labels for food type radio buttons', () => {
      render(<ListingFilters filters={defaultFilters} onChange={mockOnChange} />);

      const breakfastRadio = screen.getByTestId('food-type-radio-Breakfast');
      expect(breakfastRadio).toHaveAttribute('type', 'radio');
      expect(breakfastRadio).toHaveAttribute('name', 'food-type');
    });

    it('should have aria-label on remove filter buttons', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian'],
        location: 'Downtown',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('remove-dietary-Vegetarian')).toHaveAttribute(
        'aria-label',
        'Remove Vegetarian filter'
      );
      expect(screen.getByTestId('remove-location')).toHaveAttribute(
        'aria-label',
        'Remove location filter'
      );
      expect(screen.getByTestId('remove-food-type')).toHaveAttribute(
        'aria-label',
        'Remove food type filter'
      );
    });
  });

  describe('Combined Filter Scenarios', () => {
    it('should display all active filters together', () => {
      const filters: FilterState = {
        dietary: ['Vegetarian', 'Gluten-Free'],
        location: 'Downtown',
        food_type: 'Lunch',
      };

      render(<ListingFilters filters={filters} onChange={mockOnChange} />);

      expect(screen.getByTestId('active-dietary-tag-Vegetarian')).toBeInTheDocument();
      expect(screen.getByTestId('active-dietary-tag-Gluten-Free')).toBeInTheDocument();
      expect(screen.getByTestId('active-location-tag')).toBeInTheDocument();
      expect(screen.getByTestId('active-food-type-tag')).toBeInTheDocument();
    });
  });
});
