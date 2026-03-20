import React, { useState, useCallback, useEffect } from 'react';
import Input from '../shared/Input';

interface ListingSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  value?: string;
}

/**
 * ListingSearchBar Component
 * Provides keyword search input for filtering listings by food name, cuisine, or provider
 * Implements debouncing to avoid excessive API calls during typing
 */
const ListingSearchBar: React.FC<ListingSearchBarProps> = ({
  onSearch,
  placeholder = 'Search by food name, cuisine, or provider...',
  debounceMs = 800,
  value = '',
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Sync local state with parent value when it changes externally (e.g., clear button)
  useEffect(() => {
    setLocalSearchQuery(value);
  }, [value]);

  const handleSearchChange = useCallback(
    (inputValue: string) => {
      setLocalSearchQuery(inputValue);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new debounced timer
      const timer = setTimeout(() => {
        onSearch(inputValue);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceTimer, debounceMs, onSearch]
  );

  const handleClear = useCallback(() => {
    setLocalSearchQuery('');
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch('');
  }, [debounceTimer, onSearch]);

  return (
    <div className="relative">
      <Input
        type="text"
        value={localSearchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search listings"
      />
      {localSearchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ListingSearchBar;
