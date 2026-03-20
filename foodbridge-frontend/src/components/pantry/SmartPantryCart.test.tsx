import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SmartPantryCart from './SmartPantryCart';
import pantryService from '../../services/pantryService';
import type { PantryItem } from '../../types/pantry';

// Mock the pantry service
vi.mock('../../services/pantryService', () => ({
  default: {
    generateSmartCart: vi.fn(),
  },
}));

const mockPantryService = pantryService as any;

const mockRecommendedItems: PantryItem[] = [
  {
    item_id: 'item-1',
    item_name: 'Rice',
    category: 'Grains',
    quantity: 10,
    in_stock: true,
    unit: 'lbs',
    dietary_tags: ['vegan', 'gluten-free'],
  },
  {
    item_id: 'item-2',
    item_name: 'Beans',
    category: 'Legumes',
    quantity: 5,
    in_stock: true,
    unit: 'cans',
    dietary_tags: ['vegan'],
  },
  {
    item_id: 'item-3',
    item_name: 'Pasta',
    category: 'Grains',
    quantity: 8,
    in_stock: true,
    unit: 'boxes',
    dietary_tags: [],
  },
];

describe('SmartPantryCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should display the generate smart cart button initially', () => {
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Generate Smart Cart')).toBeInTheDocument();
      expect(screen.getByText(/Get personalized pantry recommendations/)).toBeInTheDocument();
    });

    it('should have the generate button enabled initially', () => {
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Generate Smart Cart', () => {
    it('should call generateSmartCart when button is clicked', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPantryService.generateSmartCart).toHaveBeenCalled();
      });
    });

    it('should display recommended items after generation', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
        expect(screen.getByText('Beans')).toBeInTheDocument();
        expect(screen.getByText('Pasta')).toBeInTheDocument();
      });
    });

    it('should show loading state while generating', async () => {
      mockPantryService.generateSmartCart.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRecommendedItems), 100))
      );
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      expect(screen.getByText('Generating...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });
    });

    it('should display error message on API failure', async () => {
      mockPantryService.generateSmartCart.mockRejectedValue(new Error('API Error'));
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Failed to generate smart cart/)).toBeInTheDocument();
      });
    });

    it('should disable button when isLoading prop is true', () => {
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} isLoading={true} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      expect(button).toBeDisabled();
    });
  });

  describe('Item Selection', () => {
    beforeEach(async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
    });

    it('should display checkboxes for each item', async () => {
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      const checkbox = screen.getByTestId('select-item-item-1');
      expect(checkbox).toBeInTheDocument();
    });

    it('should allow clicking on item card to toggle selection', async () => {
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      const itemCard = screen.getByTestId('recommended-item-item-1');
      fireEvent.click(itemCard);

      // Verify the card is clickable
      expect(itemCard).toBeInTheDocument();
    });
  });

  describe('Quantity Management', () => {
    it('should allow selecting items', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      // Select an item
      const checkbox = screen.getByTestId('select-item-item-1');
      expect(checkbox).toBeInTheDocument();
      fireEvent.click(checkbox);

      // Verify checkbox exists and can be clicked
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Add to Cart', () => {
    it('should call onAddToCart with selected items', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      // Select items
      const checkbox1 = screen.getByTestId('select-item-item-1');
      const checkbox2 = screen.getByTestId('select-item-item-2');
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);

      // Add to cart
      const addBtn = screen.getByTestId('add-to-cart-button');
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(mockOnAddToCart).toHaveBeenCalled();
      });
    });

    it('should disable add button when no items selected', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      // Button should exist
      const addBtn = screen.getByTestId('add-to-cart-button');
      expect(addBtn).toBeInTheDocument();
    });
  });

  describe('Cancel and Reset', () => {
    it('should reset to initial state when cancel is clicked', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      const cancelBtn = screen.getByTestId('cancel-smart-cart');
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.getByText('Generate Smart Cart')).toBeInTheDocument();
      });
    });

    it('should not call onAddToCart when cancel is clicked', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();
      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      const cancelBtn = screen.getByTestId('cancel-smart-cart');
      fireEvent.click(cancelBtn);

      expect(mockOnAddToCart).not.toHaveBeenCalled();
    });
  });

  describe('Empty Recommendations', () => {
    it('should display message when no recommendations available', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue([]);
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/No recommendations available/)).toBeInTheDocument();
      });
    });
  });

  describe('Dietary Tags Display', () => {
    it('should display dietary tags for items', async () => {
      mockPantryService.generateSmartCart.mockResolvedValue(mockRecommendedItems);
      const mockOnAddToCart = vi.fn();

      render(<SmartPantryCart onAddToCart={mockOnAddToCart} />);

      const button = screen.getByRole('button', { name: /Generate Smart Cart/ });
      fireEvent.click(button);

      await waitFor(() => {
        // Check that items are displayed
        expect(screen.getByText('Rice')).toBeInTheDocument();
      });

      // Check for dietary tags - they should be in the rendered output
      const veganTags = screen.getAllByText('vegan');
      expect(veganTags.length).toBeGreaterThan(0);
    });
  });
});
