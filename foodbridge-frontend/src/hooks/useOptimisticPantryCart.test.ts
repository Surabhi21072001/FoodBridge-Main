import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticPantryCart } from './useOptimisticPantryCart';
import type { PantryItem, CartItem } from '../types/pantry';

describe('useOptimisticPantryCart', () => {
  const mockPantryItem: PantryItem = {
    item_id: 'item-1',
    item_name: 'Rice',
    category: 'Grains',
    quantity: 50,
    in_stock: true,
    unit: 'lbs',
  };

  const mockCartItem: CartItem = {
    item_id: 'item-1',
    item_name: 'Rice',
    quantity: 5,
  };

  describe('addItemOptimistic', () => {
    it('should add new item to cart', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.addItemOptimistic(mockPantryItem, 5, apiCall);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].item_id).toBe('item-1');
      expect(result.current.cart[0].quantity).toBe(5);
    });

    it('should update quantity if item already in cart', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Add item first time
      await act(async () => {
        await result.current.addItemOptimistic(mockPantryItem, 5, apiCall);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(5);

      // Add same item again
      await act(async () => {
        await result.current.addItemOptimistic(mockPantryItem, 3, apiCall);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(8);
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.addItemOptimistic(mockPantryItem, 5, apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should work without API call', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());

      await act(async () => {
        await result.current.addItemOptimistic(mockPantryItem, 5);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(5);
    });
  });

  describe('removeItemOptimistic', () => {
    it('should remove item from cart', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Add item first
      act(() => {
        result.current.setCart([mockCartItem]);
      });

      await act(async () => {
        await result.current.removeItemOptimistic('item-1', apiCall);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Add item first
      act(() => {
        result.current.setCart([mockCartItem]);
      });

      await act(async () => {
        try {
          await result.current.removeItemOptimistic('item-1', apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].item_id).toBe('item-1');
    });
  });

  describe('updateQuantityOptimistic', () => {
    it('should update item quantity', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Add item first
      act(() => {
        result.current.setCart([mockCartItem]);
      });

      await act(async () => {
        await result.current.updateQuantityOptimistic('item-1', 10, apiCall);
      });

      expect(result.current.cart[0].quantity).toBe(10);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Add item first
      act(() => {
        result.current.setCart([mockCartItem]);
      });

      await act(async () => {
        try {
          await result.current.updateQuantityOptimistic('item-1', 10, apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.cart[0].quantity).toBe(5);
    });
  });

  describe('clearCartOptimistic', () => {
    it('should clear all items from cart', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const apiCall = vi.fn().mockResolvedValue(undefined);

      // Add items first
      act(() => {
        result.current.setCart([mockCartItem, { ...mockCartItem, item_id: 'item-2' }]);
      });

      expect(result.current.cart).toHaveLength(2);

      await act(async () => {
        await result.current.clearCartOptimistic(apiCall);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      const { result } = renderHook(() => useOptimisticPantryCart());
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      // Add items first
      act(() => {
        result.current.setCart([mockCartItem]);
      });

      await act(async () => {
        try {
          await result.current.clearCartOptimistic(apiCall);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('setCart', () => {
    it('should update cart state', () => {
      const { result } = renderHook(() => useOptimisticPantryCart());

      act(() => {
        result.current.setCart([mockCartItem]);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].item_id).toBe('item-1');
    });
  });
});
