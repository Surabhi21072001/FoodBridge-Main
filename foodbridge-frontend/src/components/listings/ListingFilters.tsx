import React, { useState } from 'react';
import type { FilterState } from '../../types/listings';
import Input from '../shared/Input';
import Button from '../shared/Button';

export interface ListingFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

// Common dietary options
const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
];

// Common food types
const FOOD_TYPE_OPTIONS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Beverage',
];

const ListingFilters: React.FC<ListingFiltersProps> = ({ filters, onChange }) => {
  const [locationInput, setLocationInput] = useState(filters.location);

  const handleDietaryToggle = (dietary: string) => {
    const updated = filters.dietary.includes(dietary)
      ? filters.dietary.filter((d) => d !== dietary)
      : [...filters.dietary, dietary];
    onChange({ ...filters, dietary: updated });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(e.target.value);
  };

  const handleLocationApply = () => {
    onChange({ ...filters, location: locationInput });
  };

  const handleLocationClear = () => {
    setLocationInput('');
    onChange({ ...filters, location: '' });
  };

  const handleFoodTypeChange = (foodType: string) => {
    onChange({ ...filters, food_type: foodType === filters.food_type ? '' : foodType });
  };

  const handleClearAllFilters = () => {
    setLocationInput('');
    onChange({ dietary: [], location: '', food_type: '' });
  };

  // Calculate active filter count
  const activeFilterCount =
    filters.dietary.length + (filters.location ? 1 : 0) + (filters.food_type ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4" data-testid="listing-filters">
      {/* Filter count header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Dietary Preferences */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Dietary Preferences</h4>
        <div className="space-y-2">
          {DIETARY_OPTIONS.map((dietary) => (
            <label key={dietary} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.dietary.includes(dietary)}
                onChange={() => handleDietaryToggle(dietary)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                data-testid={`dietary-checkbox-${dietary}`}
              />
              <span className="text-sm text-gray-700">{dietary}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Location</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter location"
            value={locationInput}
            onChange={handleLocationChange}
            className="flex-1"
            data-testid="location-input"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLocationApply}
            data-testid="location-apply-button"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Food Type */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Food Type</h4>
        <div className="space-y-2">
          {FOOD_TYPE_OPTIONS.map((foodType) => (
            <label key={foodType} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="food-type"
                checked={filters.food_type === foodType}
                onChange={() => handleFoodTypeChange(foodType)}
                className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                data-testid={`food-type-radio-${foodType}`}
              />
              <span className="text-sm text-gray-700">{foodType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Dietary tags */}
            {filters.dietary.map((dietary) => (
              <div
                key={dietary}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                data-testid={`active-dietary-tag-${dietary}`}
              >
                <span>{dietary}</span>
                <button
                  onClick={() => handleDietaryToggle(dietary)}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-semibold"
                  aria-label={`Remove ${dietary} filter`}
                  data-testid={`remove-dietary-${dietary}`}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Location tag */}
            {filters.location && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                data-testid="active-location-tag"
              >
                <span>{filters.location}</span>
                <button
                  onClick={handleLocationClear}
                  className="ml-1 text-green-600 hover:text-green-800 font-semibold"
                  aria-label="Remove location filter"
                  data-testid="remove-location"
                >
                  ×
                </button>
              </div>
            )}

            {/* Food type tag */}
            {filters.food_type && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                data-testid="active-food-type-tag"
              >
                <span>{filters.food_type}</span>
                <button
                  onClick={() => handleFoodTypeChange(filters.food_type)}
                  className="ml-1 text-purple-600 hover:text-purple-800 font-semibold"
                  aria-label="Remove food type filter"
                  data-testid="remove-food-type"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="w-full"
            data-testid="clear-all-filters"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingFilters;
