/**
 * Optimistic Updates Utility
 * Provides utilities for optimistic UI updates with automatic rollback on API failures
 */

export interface OptimisticUpdateOptions<T> {
  /**
   * The optimistic data to display immediately
   */
  optimisticData: T;
  /**
   * Function to revert UI to previous state if API fails
   */
  onRollback: (previousData: T) => void;
  /**
   * Optional callback when update succeeds
   */
  onSuccess?: (data: T) => void;
  /**
   * Optional callback when update fails
   */
  onError?: (error: Error) => void;
}

/**
 * Execute an API call with optimistic UI update
 * Updates UI immediately, rolls back if API fails
 *
 * @param apiCall - Async function that makes the API request
 * @param options - Configuration for optimistic update
 * @returns Promise resolving to the API response
 */
export async function executeOptimisticUpdate<T>(
  apiCall: () => Promise<T>,
  options: OptimisticUpdateOptions<T>
): Promise<T> {
  const { optimisticData, onRollback, onSuccess, onError } = options;

  try {
    // Execute the API call
    const result = await apiCall();

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    // Rollback UI to previous state
    onRollback(optimisticData);

    // Call error callback if provided
    if (onError && error instanceof Error) {
      onError(error);
    }

    throw error;
  }
}

/**
 * Create an optimistic update for a list item modification
 * Useful for updating items in arrays (e.g., reservations, notifications)
 *
 * @param items - Current array of items
 * @param itemId - ID of item to update
 * @param updates - Partial updates to apply
 * @returns Updated array with optimistic changes
 */
export function createOptimisticListUpdate<T extends { [key: string]: any }>(
  items: T[],
  itemId: string,
  updates: Partial<T>,
  idField: string = 'id'
): T[] {
  return items.map((item) =>
    item[idField] === itemId ? { ...item, ...updates } : item
  );
}

/**
 * Create an optimistic update for removing an item from a list
 * Useful for canceling reservations or deleting notifications
 *
 * @param items - Current array of items
 * @param itemId - ID of item to remove
 * @returns Array with item removed
 */
export function createOptimisticListRemoval<T extends { [key: string]: any }>(
  items: T[],
  itemId: string,
  idField: string = 'id'
): T[] {
  return items.filter((item) => item[idField] !== itemId);
}

/**
 * Create an optimistic update for adding an item to a list
 * Useful for creating new reservations or appointments
 *
 * @param items - Current array of items
 * @param newItem - Item to add
 * @returns Array with new item added
 */
export function createOptimisticListAddition<T>(items: T[], newItem: T): T[] {
  return [newItem, ...items];
}
