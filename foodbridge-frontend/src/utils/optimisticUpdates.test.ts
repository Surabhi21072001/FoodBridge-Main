import { describe, it, expect, vi } from 'vitest';
import {
  executeOptimisticUpdate,
  createOptimisticListUpdate,
  createOptimisticListRemoval,
  createOptimisticListAddition,
} from './optimisticUpdates';

describe('optimisticUpdates', () => {
  describe('executeOptimisticUpdate', () => {
    it('should call onSuccess when API call succeeds', async () => {
      const onSuccess = vi.fn();
      const onRollback = vi.fn();
      const apiCall = vi.fn().mockResolvedValue({ id: '1', value: 'updated' });

      const result = await executeOptimisticUpdate(apiCall, {
        optimisticData: { id: '1', value: 'original' },
        onRollback,
        onSuccess,
      });

      expect(result).toEqual({ id: '1', value: 'updated' });
      expect(onSuccess).toHaveBeenCalledWith({ id: '1', value: 'updated' });
      expect(onRollback).not.toHaveBeenCalled();
    });

    it('should call onRollback when API call fails', async () => {
      const onSuccess = vi.fn();
      const onRollback = vi.fn();
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      await expect(
        executeOptimisticUpdate(apiCall, {
          optimisticData: { id: '1', value: 'original' },
          onRollback,
          onSuccess,
        })
      ).rejects.toThrow('API failed');

      expect(onRollback).toHaveBeenCalledWith({ id: '1', value: 'original' });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onError when API call fails and onError is provided', async () => {
      const onError = vi.fn();
      const onRollback = vi.fn();
      const error = new Error('API failed');
      const apiCall = vi.fn().mockRejectedValue(error);

      await expect(
        executeOptimisticUpdate(apiCall, {
          optimisticData: { id: '1', value: 'original' },
          onRollback,
          onError,
        })
      ).rejects.toThrow('API failed');

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should not call onError if error is not an Error instance', async () => {
      const onError = vi.fn();
      const onRollback = vi.fn();
      const apiCall = vi.fn().mockRejectedValue('string error');

      await expect(
        executeOptimisticUpdate(apiCall, {
          optimisticData: { id: '1', value: 'original' },
          onRollback,
          onError,
        })
      ).rejects.toEqual('string error');

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('createOptimisticListUpdate', () => {
    it('should update item with matching id', () => {
      const items = [
        { id: '1', name: 'Item 1', status: 'active' },
        { id: '2', name: 'Item 2', status: 'active' },
      ];

      const result = createOptimisticListUpdate(items, '1', { status: 'inactive' });

      expect(result).toEqual([
        { id: '1', name: 'Item 1', status: 'inactive' },
        { id: '2', name: 'Item 2', status: 'active' },
      ]);
    });

    it('should use custom idField', () => {
      const items = [
        { item_id: '1', name: 'Item 1', status: 'active' },
        { item_id: '2', name: 'Item 2', status: 'active' },
      ];

      const result = createOptimisticListUpdate(
        items,
        '1',
        { status: 'inactive' },
        'item_id'
      );

      expect(result).toEqual([
        { item_id: '1', name: 'Item 1', status: 'inactive' },
        { item_id: '2', name: 'Item 2', status: 'active' },
      ]);
    });

    it('should not modify items if id not found', () => {
      const items = [
        { id: '1', name: 'Item 1', status: 'active' },
        { id: '2', name: 'Item 2', status: 'active' },
      ];

      const result = createOptimisticListUpdate(items, '3', { status: 'inactive' });

      expect(result).toEqual(items);
    });

    it('should merge updates with existing item properties', () => {
      const items = [
        { id: '1', name: 'Item 1', status: 'active', count: 5 },
      ];

      const result = createOptimisticListUpdate(items, '1', { status: 'inactive' });

      expect(result[0]).toEqual({
        id: '1',
        name: 'Item 1',
        status: 'inactive',
        count: 5,
      });
    });
  });

  describe('createOptimisticListRemoval', () => {
    it('should remove item with matching id', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const result = createOptimisticListRemoval(items, '2');

      expect(result).toEqual([
        { id: '1', name: 'Item 1' },
        { id: '3', name: 'Item 3' },
      ]);
    });

    it('should use custom idField', () => {
      const items = [
        { item_id: '1', name: 'Item 1' },
        { item_id: '2', name: 'Item 2' },
      ];

      const result = createOptimisticListRemoval(items, '1', 'item_id');

      expect(result).toEqual([{ item_id: '2', name: 'Item 2' }]);
    });

    it('should return unchanged array if id not found', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const result = createOptimisticListRemoval(items, '3');

      expect(result).toEqual(items);
    });

    it('should handle empty array', () => {
      const items: any[] = [];
      const result = createOptimisticListRemoval(items, '1');
      expect(result).toEqual([]);
    });
  });

  describe('createOptimisticListAddition', () => {
    it('should add item to beginning of list', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const newItem = { id: '3', name: 'Item 3' };

      const result = createOptimisticListAddition(items, newItem);

      expect(result).toEqual([
        { id: '3', name: 'Item 3' },
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);
    });

    it('should add item to empty list', () => {
      const items: any[] = [];
      const newItem = { id: '1', name: 'Item 1' };

      const result = createOptimisticListAddition(items, newItem);

      expect(result).toEqual([{ id: '1', name: 'Item 1' }]);
    });

    it('should preserve original array', () => {
      const items = [{ id: '1', name: 'Item 1' }];
      const newItem = { id: '2', name: 'Item 2' };

      const result = createOptimisticListAddition(items, newItem);

      expect(items).toEqual([{ id: '1', name: 'Item 1' }]);
      expect(result).toHaveLength(2);
    });
  });
});
