import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PantryCart from './PantryCart';
import type { CartItem } from '../../types/pantry';

describe('PantryCart Component', () => {
  const mockOnRemove = vi.fn();
  const mockOnUpdateQuantity = vi.fn();

  const mockCartItems: CartItem[] = [
    {
      item_id: 'item-1',
      item_name: 'Rice',
      quantity: 2,
    },
    {
      item_id: 'item-2',
      item_name: 'Beans',
      quantity: 1,
    },
    {
      item_id: 'item-3',
      item_name: 'Pasta',
      quantity: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty Cart', () => {
    it('should display empty state when no items in cart', () => {
      render(
        <PantryCart
          items={[]}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Add items from the inventory to get started')).toBeInTheDocument();
    });
  });

  describe('Cart Display', () => {
    it('should display all cart items', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByText('Rice')).toBeInTheDocument();
      expect(screen.getByText('Beans')).toBeInTheDocument();
      expect(screen.getByText('Pasta')).toBeInTheDocument();
    });

    it('should display correct quantity for each item', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const riceQuantityInput = screen.getByTestId('quantity-input-item-1') as HTMLInputElement;
      const beansQuantityInput = screen.getByTestId('quantity-input-item-2') as HTMLInputElement;
      const pastaQuantityInput = screen.getByTestId('quantity-input-item-3') as HTMLInputElement;

      expect(riceQuantityInput.value).toBe('2');
      expect(beansQuantityInput.value).toBe('1');
      expect(pastaQuantityInput.value).toBe('3');
    });

    it('should render cart item containers with correct test IDs', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByTestId('cart-item-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-item-3')).toBeInTheDocument();
    });
  });

  describe('Total Item Count', () => {
    it('should calculate and display correct total item count', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      // Total: 2 + 1 + 3 = 6 items
      expect(screen.getByTestId('total-item-count')).toHaveTextContent('6 items');
    });

    it('should display singular "item" when total is 1', () => {
      const singleItem: CartItem[] = [
        {
          item_id: 'item-1',
          item_name: 'Rice',
          quantity: 1,
        },
      ];

      render(
        <PantryCart
          items={singleItem}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByTestId('total-item-count')).toHaveTextContent('1 item');
    });

    it('should update total count in footer', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      // Check footer summary
      const totalElements = screen.getAllByText('6');
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  describe('Quantity Adjustment', () => {
    it('should call onUpdateQuantity when quantity input changes', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const quantityInput = screen.getByTestId('quantity-input-item-1') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '5' } });

      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 5);
    });

    it('should call onUpdateQuantity when increase button is clicked', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const increaseButton = screen.getByTestId('increase-quantity-item-1');
      fireEvent.click(increaseButton);

      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 3);
    });

    it('should call onUpdateQuantity when decrease button is clicked', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const decreaseButton = screen.getByTestId('decrease-quantity-item-1');
      fireEvent.click(decreaseButton);

      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
    });

    it('should not allow quantity to go below 1 when using decrease button', () => {
      const singleItem: CartItem[] = [
        {
          item_id: 'item-1',
          item_name: 'Rice',
          quantity: 1,
        },
      ];

      render(
        <PantryCart
          items={singleItem}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const decreaseButton = screen.getByTestId('decrease-quantity-item-1');
      fireEvent.click(decreaseButton);

      // Should call with 1 (max(1, 1-1) = max(1, 0) = 1)
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
    });

    it('should enforce minimum quantity of 1 when typing in input', async () => {
      const user = userEvent.setup();
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const quantityInput = screen.getByTestId('quantity-input-item-1') as HTMLInputElement;
      await user.clear(quantityInput);
      await user.type(quantityInput, '0');

      // Should enforce minimum of 1
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
    });
  });

  describe('Item Removal', () => {
    it('should call onRemove when remove button is clicked', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const removeButton = screen.getByTestId('remove-item-item-1');
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith('item-1');
    });

    it('should call onRemove for correct item when multiple items exist', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const removeButton = screen.getByTestId('remove-item-item-2');
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith('item-2');
    });

    it('should have remove button for each item', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByTestId('remove-item-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-item-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-item-item-3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for quantity buttons', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const decreaseButton = screen.getByTestId('decrease-quantity-item-1');
      const increaseButton = screen.getByTestId('increase-quantity-item-1');
      const removeButton = screen.getByTestId('remove-item-item-1');

      expect(decreaseButton).toHaveAttribute('aria-label', 'Decrease quantity for Rice');
      expect(increaseButton).toHaveAttribute('aria-label', 'Increase quantity for Rice');
      expect(removeButton).toHaveAttribute('aria-label', 'Remove Rice from cart');
    });

    it('should have proper aria labels for all items', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByLabelText('Decrease quantity for Beans')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity for Pasta')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Beans from cart')).toBeInTheDocument();
    });
  });

  describe('UI Structure', () => {
    it('should render cart with proper structure', () => {
      const { container } = render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(screen.getByTestId('pantry-cart')).toBeInTheDocument();
      expect(screen.getByText('Your Cart')).toBeInTheDocument();
    });

    it('should display footer with summary text', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      expect(
        screen.getByText('Review your selections and proceed to book an appointment')
      ).toBeInTheDocument();
    });
  });

  describe('Multiple Items Interaction', () => {
    it('should handle multiple quantity updates independently', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const increaseButton1 = screen.getByTestId('increase-quantity-item-1');
      const decreaseButton2 = screen.getByTestId('decrease-quantity-item-2');

      fireEvent.click(increaseButton1);
      fireEvent.click(decreaseButton2);

      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 3);
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-2', 1);
    });

    it('should handle multiple removals independently', () => {
      render(
        <PantryCart
          items={mockCartItems}
          onRemove={mockOnRemove}
          onUpdateQuantity={mockOnUpdateQuantity}
        />
      );

      const removeButton1 = screen.getByTestId('remove-item-item-1');
      const removeButton3 = screen.getByTestId('remove-item-item-3');

      fireEvent.click(removeButton1);
      fireEvent.click(removeButton3);

      expect(mockOnRemove).toHaveBeenCalledWith('item-1');
      expect(mockOnRemove).toHaveBeenCalledWith('item-3');
    });
  });
});
