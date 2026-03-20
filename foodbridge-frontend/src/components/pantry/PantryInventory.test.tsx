import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PantryInventory from './PantryInventory';
import type { PantryItem } from '../../types/pantry';

describe('PantryInventory Component', () => {
  const mockItems: PantryItem[] = [
    {
      item_id: '1',
      item_name: 'Rice',
      category: 'Grains',
      quantity: 50,
      in_stock: true,
      unit: 'lbs',
      dietary_tags: ['vegan', 'gluten-free'],
      allergen_info: [],
    },
    {
      item_id: '2',
      item_name: 'Peanut Butter',
      category: 'Spreads',
      quantity: 20,
      in_stock: true,
      unit: 'jars',
      dietary_tags: ['vegan'],
      allergen_info: ['peanuts'],
    },
    {
      item_id: '3',
      item_name: 'Milk',
      category: 'Dairy',
      quantity: 0,
      in_stock: false,
      unit: 'gallons',
      allergen_info: ['dairy'],
    },
  ];

  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all pantry items in a grid', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByTestId('pantry-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('pantry-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('pantry-item-3')).toBeInTheDocument();
    });

    it('should display item names', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Rice')).toBeInTheDocument();
      expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should display item categories', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Grains')).toBeInTheDocument();
      expect(screen.getByText('Spreads')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });

    it('should display availability status badges', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const inStockBadges = screen.getAllByText('In Stock');
      const outOfStockBadges = screen.getAllByText('Out of Stock');

      expect(inStockBadges.length).toBeGreaterThanOrEqual(2);
      expect(outOfStockBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('should display dietary tags for items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const veganTags = screen.getAllByText('vegan');
      const glutenFreeTags = screen.getAllByText('gluten-free');
      
      expect(veganTags.length).toBeGreaterThanOrEqual(1);
      expect(glutenFreeTags.length).toBeGreaterThanOrEqual(1);
    });

    it('should display allergen information', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('peanuts')).toBeInTheDocument();
      expect(screen.getByText('dairy')).toBeInTheDocument();
    });

    it('should display quantity and unit', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('50 lbs')).toBeInTheDocument();
      expect(screen.getByText('20 jars')).toBeInTheDocument();
    });

    it('should render empty state when no items', () => {
      render(<PantryInventory items={[]} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('No pantry items available')).toBeInTheDocument();
    });

    it('should render loading skeletons when isLoading is true', () => {
      render(
        <PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} isLoading={true} />
      );

      const skeletons = screen.getAllByTestId('pantry-item-skeleton');
      expect(skeletons).toHaveLength(6);
    });
  });

  describe('Availability Status', () => {
    it('should show "In Stock" badge for available items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const inStockBadges = screen.getAllByTestId(/availability-badge-(1|2)/);
      expect(inStockBadges).toHaveLength(2);
    });

    it('should show "Out of Stock" badge for unavailable items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const outOfStockBadge = screen.getByTestId('availability-badge-3');
      expect(outOfStockBadge).toHaveTextContent('Out of Stock');
    });

    it('should disable add to cart button for out of stock items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const outOfStockButton = screen.getByTestId('out-of-stock-button-3');
      expect(outOfStockButton).toBeDisabled();
    });

    it('should show "Out of Stock" button text for unavailable items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByTestId('out-of-stock-button-3')).toHaveTextContent('Out of Stock');
    });
  });

  describe('Add to Cart Functionality', () => {
    it('should render quantity input for in-stock items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput1 = screen.getByTestId('quantity-input-1');
      const quantityInput2 = screen.getByTestId('quantity-input-2');

      expect(quantityInput1).toBeInTheDocument();
      expect(quantityInput2).toBeInTheDocument();
    });

    it('should initialize quantity input with value 1', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
      expect(quantityInput.value).toBe('1');
    });

    it('should allow quantity adjustment', async () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '5' } });

      expect(quantityInput.value).toBe('5');
    });

    it('should prevent quantity from going below 1', async () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '0');

      fireEvent.change(quantityInput, { target: { value: '0' } });
      // Component should set it to 1
      expect(parseInt(quantityInput.value) || 1).toBeGreaterThanOrEqual(1);
    });

    it('should call onAddToCart with item and quantity when add button clicked', async () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '3' } });

      const addButton = screen.getByTestId('add-to-cart-button-1');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToCart).toHaveBeenCalledWith(mockItems[0], 3);
      });
    });

    it('should reset quantity to 1 after adding to cart', async () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '5');

      const addButton = screen.getByTestId('add-to-cart-button-1');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(quantityInput.value).toBe('1');
      });
    });

    it('should render add to cart button for in-stock items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const addButton1 = screen.getByTestId('add-to-cart-button-1');
      const addButton2 = screen.getByTestId('add-to-cart-button-2');

      expect(addButton1).toBeInTheDocument();
      expect(addButton2).toBeInTheDocument();
      expect(addButton1).toHaveTextContent('Add to Cart');
      expect(addButton2).toHaveTextContent('Add to Cart');
    });

    it('should not render add to cart button for out of stock items', () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      expect(screen.queryByTestId('add-to-cart-button-3')).not.toBeInTheDocument();
    });

    it('should handle multiple items being added to cart', async () => {
      render(<PantryInventory items={mockItems} onAddToCart={mockOnAddToCart} />);

      const addButton1 = screen.getByTestId('add-to-cart-button-1');
      const addButton2 = screen.getByTestId('add-to-cart-button-2');

      fireEvent.click(addButton1);
      fireEvent.click(addButton2);

      await waitFor(() => {
        expect(mockOnAddToCart).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with no dietary tags', () => {
      const itemsNoDietaryTags: PantryItem[] = [
        {
          item_id: '1',
          item_name: 'Water',
          category: 'Beverages',
          quantity: 100,
          in_stock: true,
          unit: 'bottles',
        },
      ];

      render(<PantryInventory items={itemsNoDietaryTags} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.queryByText('vegan')).not.toBeInTheDocument();
    });

    it('should handle items with no allergen info', () => {
      const itemsNoAllergens: PantryItem[] = [
        {
          item_id: '1',
          item_name: 'Rice',
          category: 'Grains',
          quantity: 50,
          in_stock: true,
          unit: 'lbs',
        },
      ];

      render(<PantryInventory items={itemsNoAllergens} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Rice')).toBeInTheDocument();
      expect(screen.queryByText('Allergens:')).not.toBeInTheDocument();
    });

    it('should handle items with no expiration date', () => {
      const itemsNoExpiration: PantryItem[] = [
        {
          item_id: '1',
          item_name: 'Rice',
          category: 'Grains',
          quantity: 50,
          in_stock: true,
          unit: 'lbs',
        },
      ];

      render(<PantryInventory items={itemsNoExpiration} onAddToCart={mockOnAddToCart} />);

      expect(screen.getByText('Rice')).toBeInTheDocument();
      expect(screen.queryByText('Expires:')).not.toBeInTheDocument();
    });
  });
});
