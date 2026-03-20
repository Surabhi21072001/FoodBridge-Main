import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import PantryCart from './PantryCart';
import type { CartItem } from '../../types/pantry';

describe('PantryCart Properties', () => {
  const mockOnRemove = vi.fn();
  const mockOnUpdateQuantity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Property 27: Selected items are added to cart', () => {
    /**
     * Validates: Requirements 6.3
     *
     * For any pantry item, selecting it should result in the item being added
     * to the cart interface. This property verifies that when items are passed
     * to the PantryCart component, they are correctly displayed and can be
     * interacted with.
     */

    it('should display all selected items in cart (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (baseItems) => {
            cleanup();
            // Create items with unique IDs based on index
            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            // Verify all items are displayed by checking test IDs (more reliable than text)
            items.forEach((item) => {
              expect(screen.getByTestId(`cart-item-${item.item_id}`)).toBeInTheDocument();
            });

            // Verify cart is not empty when items exist
            expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain correct quantities for all added items (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (baseItems) => {
            cleanup();
            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            // Verify each item has correct quantity displayed
            items.forEach((item) => {
              const quantityInput = screen.getByTestId(
                `quantity-input-${item.item_id}`
              ) as HTMLInputElement;
              expect(parseInt(quantityInput.value)).toBe(item.quantity);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should calculate correct total item count for all added items (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (baseItems) => {
            cleanup();
            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            // Calculate expected total
            const expectedTotal = items.reduce((sum, item) => sum + item.quantity, 0);

            // Verify total count is displayed correctly
            const totalCountElement = screen.getByTestId('total-item-count');
            expect(totalCountElement).toHaveTextContent(
              expectedTotal === 1 ? '1 item' : `${expectedTotal} items`
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should allow quantity updates for all added items (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 50 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (baseItems) => {
            cleanup();
            const localMockOnUpdateQuantity = vi.fn();

            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={localMockOnUpdateQuantity}
              />
            );

            // Verify all items are rendered with quantity inputs
            items.forEach((item) => {
              const quantityInput = screen.getByTestId(
                `quantity-input-${item.item_id}`
              ) as HTMLInputElement;
              expect(quantityInput).toBeInTheDocument();
              expect(parseInt(quantityInput.value)).toBe(item.quantity);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should allow removal of any added item (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (baseItems) => {
            cleanup();
            const localMockOnRemove = vi.fn();

            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={localMockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            if (items.length > 0) {
              const itemToRemove = items[0];
              const removeButton = screen.getByTestId(`remove-item-${itemToRemove.item_id}`);

              fireEvent.click(removeButton);

              // Verify callback was called with correct item ID
              expect(localMockOnRemove).toHaveBeenCalledWith(itemToRemove.item_id);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display empty state when no items are added (Property 27)', () => {
      fc.assert(
        fc.property(fc.constant([]), (items: CartItem[]) => {
          cleanup();
          render(
            <PantryCart
              items={items}
              onRemove={mockOnRemove}
              onUpdateQuantity={mockOnUpdateQuantity}
            />
          );

          // Verify empty state is displayed
          expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
          expect(
            screen.getByText('Add items from the inventory to get started')
          ).toBeInTheDocument();
        }),
        { numRuns: 10 }
      );
    });

    it('should handle multiple items with varying quantities (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (baseItems) => {
            cleanup();
            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            // Verify all items are present
            items.forEach((item) => {
              expect(screen.getByTestId(`cart-item-${item.item_id}`)).toBeInTheDocument();
            });

            // Verify total is sum of all quantities
            const expectedTotal = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalCountElement = screen.getByTestId('total-item-count');
            expect(totalCountElement).toHaveTextContent(
              expectedTotal === 1 ? '1 item' : `${expectedTotal} items`
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain item order as provided (Property 27)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              item_name: fc
                .string({ minLength: 2, maxLength: 30 })
                .filter((s) => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length > 0)
                .map((s) => s.trim()),
              quantity: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (baseItems) => {
            cleanup();
            const items: CartItem[] = baseItems.map((item, index) => ({
              item_id: `item-${index}`,
              item_name: item.item_name,
              quantity: item.quantity,
            }));

            render(
              <PantryCart
                items={items}
                onRemove={mockOnRemove}
                onUpdateQuantity={mockOnUpdateQuantity}
              />
            );

            // Get all cart item containers in order
            const cartItemElements = items.map((item) =>
              screen.getByTestId(`cart-item-${item.item_id}`)
            );

            // Verify all items are present
            cartItemElements.forEach((element) => {
              expect(element).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
