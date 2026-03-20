import { useState, useCallback } from 'react';
import type { CartItem, PantryItem } from '../types/pantry';
import {
  createOptimisticListUpdate,
  createOptimisticListRemoval,
  createOptimisticListAddition,
} from '../utils/optimisticUpdates';

interface UseOptimisticPantryCartReturn {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addItemOptimistic: (
    item: PantryItem,
    quantity: number,
    apiCall?: () => Promise<void>
  ) => Promise<void>;
  removeItemOptimistic: (
    itemId: string,
    apiCall?: () => Promise<void>
  ) => Promise<void>;
  updateQuantityOptimistic: (
    itemId: string,
    quantity: number,
    apiCall?: () => Promise<void>
  ) => Promise<void>;
  clearCartOptimistic: (apiCall?: () => Promise<void>) => Promise<void>;
}

/**
 * Hook for managing optimistic pantry cart updates
 * Handles adding, removing, and updating cart items with immediate UI feedback
 */
export const useOptimisticPantryCart = (): UseOptimisticPantryCartReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);

  /**
   * Add item to cart with optimistic update
   * Immediately adds item, rolls back if API fails
   */
  const addItemOptimistic = useCallback(
    async (
      item: PantryItem,
      quantity: number,
      apiCall?: () => Promise<void>
    ): Promise<void> => {
      const cartItem: CartItem = {
        item_id: item.id,
        item_name: item.item_name,
        quantity,
      };

      const previousCart = cart;

      // Check if item already in cart
      const existingItem = cart.find((c) => c.item_id === item.id);
      if (existingItem) {
        // Update quantity optimistically
        setCart((prev) =>
          createOptimisticListUpdate(
            prev,
            item.id,
            { quantity: existingItem.quantity + quantity },
            'item_id'
          )
        );
      } else {
        // Add new item optimistically
        setCart((prev) => createOptimisticListAddition(prev, cartItem));
      }

      try {
        // Execute API call if provided
        if (apiCall) {
          await apiCall();
        }
      } catch (error) {
        // Rollback to previous state
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  /**
   * Remove item from cart with optimistic update
   * Immediately removes item, rolls back if API fails
   */
  const removeItemOptimistic = useCallback(
    async (itemId: string, apiCall?: () => Promise<void>): Promise<void> => {
      const previousCart = cart;

      // Optimistically remove item
      setCart((prev) => createOptimisticListRemoval(prev, itemId, 'item_id'));

      try {
        // Execute API call if provided
        if (apiCall) {
          await apiCall();
        }
      } catch (error) {
        // Rollback to previous state
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  /**
   * Update item quantity with optimistic update
   * Immediately updates quantity, rolls back if API fails
   */
  const updateQuantityOptimistic = useCallback(
    async (
      itemId: string,
      quantity: number,
      apiCall?: () => Promise<void>
    ): Promise<void> => {
      const previousCart = cart;

      // Optimistically update quantity
      setCart((prev) =>
        createOptimisticListUpdate(prev, itemId, { quantity }, 'item_id')
      );

      try {
        // Execute API call if provided
        if (apiCall) {
          await apiCall();
        }
      } catch (error) {
        // Rollback to previous state
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  /**
   * Clear cart with optimistic update
   * Immediately clears cart, rolls back if API fails
   */
  const clearCartOptimistic = useCallback(
    async (apiCall?: () => Promise<void>): Promise<void> => {
      const previousCart = cart;

      // Optimistically clear cart
      setCart([]);

      try {
        // Execute API call if provided
        if (apiCall) {
          await apiCall();
        }
      } catch (error) {
        // Rollback to previous state
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  return {
    cart,
    setCart,
    addItemOptimistic,
    removeItemOptimistic,
    updateQuantityOptimistic,
    clearCartOptimistic,
  };
};
