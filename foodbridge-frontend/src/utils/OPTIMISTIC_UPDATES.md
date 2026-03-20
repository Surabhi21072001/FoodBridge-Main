# Optimistic UI Updates

## Overview

Optimistic UI updates provide immediate visual feedback to users by updating the UI before API requests complete. If the API request fails, the UI automatically rolls back to the previous state. This pattern significantly improves perceived performance and user experience.

## Architecture

### Core Components

1. **optimisticUpdates.ts** - Utility functions for optimistic updates
2. **useOptimisticReservations.ts** - Hook for reservation operations
3. **useOptimisticPantryCart.ts** - Hook for pantry cart operations
4. **useOptimisticNotifications.ts** - Hook for notification operations

## Usage Patterns

### 1. Reservations (Requirement 5.4)

Update available quantity immediately when a reservation is created:

```typescript
import { useOptimisticReservations } from '../hooks';

function ReservationForm({ listing }) {
  const { reservations, createReservationOptimistic } = useOptimisticReservations();
  const { showToast } = useToast();

  const handleReserve = async (quantity: number) => {
    try {
      await createReservationOptimistic(
        listing,
        quantity,
        () => reservationsService.createReservation({ listing_id: listing.listing_id, quantity })
      );
      showToast('Reservation confirmed!', 'success');
    } catch (error) {
      showToast('Reservation failed. Please try again.', 'error');
    }
  };

  return (
    // Form JSX
  );
}
```

**What happens:**
1. User submits reservation form
2. UI immediately shows:
   - New reservation in reservations list
   - Updated available_quantity on listing (decreased by reserved amount)
3. API request is sent in background
4. On success: Temporary reservation replaced with actual one from API
5. On failure: UI rolls back to previous state, error toast shown

### 2. Pantry Cart (Requirement 6.3)

Update cart immediately when items are added/removed:

```typescript
import { useOptimisticPantryCart } from '../hooks';

function PantryInventory() {
  const { cart, addItemOptimistic, removeItemOptimistic } = useOptimisticPantryCart();
  const { showToast } = useToast();

  const handleAddToCart = async (item: PantryItem, quantity: number) => {
    try {
      await addItemOptimistic(item, quantity);
      showToast(`${item.item_name} added to cart`, 'success');
    } catch (error) {
      showToast('Failed to add item', 'error');
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeItemOptimistic(itemId);
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  return (
    // Inventory JSX
  );
}
```

**What happens:**
1. User clicks "Add to Cart"
2. UI immediately shows item in cart
3. If item already in cart, quantity is updated immediately
4. On success: Cart state persists
5. On failure: Item removed from cart, error toast shown

### 3. Notifications (Requirement 8.2)

Mark notifications as read immediately:

```typescript
import { useOptimisticNotifications } from '../hooks';

function NotificationItem({ notification }) {
  const { markAsReadOptimistic, deleteNotificationOptimistic } = useOptimisticNotifications();
  const { showToast } = useToast();

  const handleMarkAsRead = async () => {
    try {
      await markAsReadOptimistic(
        notification.notification_id,
        () => notificationsService.markAsRead(notification.notification_id)
      );
    } catch (error) {
      showToast('Failed to update notification', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotificationOptimistic(
        notification.notification_id,
        () => notificationsService.deleteNotification(notification.notification_id)
      );
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  return (
    // Notification JSX
  );
}
```

**What happens:**
1. User clicks notification or delete button
2. UI immediately:
   - Marks notification as read (is_read = true)
   - Decrements unread count if it was unread
   - Removes notification from list (if deleting)
3. API request sent in background
4. On success: Changes persist
5. On failure: UI rolls back, error toast shown

## API Reference

### executeOptimisticUpdate

Generic function for executing any API call with optimistic updates:

```typescript
async function executeOptimisticUpdate<T>(
  apiCall: () => Promise<T>,
  options: OptimisticUpdateOptions<T>
): Promise<T>
```

**Parameters:**
- `apiCall` - Async function that makes the API request
- `options.optimisticData` - Data to display immediately
- `options.onRollback` - Function to revert UI on failure
- `options.onSuccess` - Optional callback on success
- `options.onError` - Optional callback on error

**Example:**
```typescript
const result = await executeOptimisticUpdate(
  () => api.post('/reservations', data),
  {
    optimisticData: newReservation,
    onRollback: (prev) => setReservations(prev),
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);
```

### List Manipulation Utilities

#### createOptimisticListUpdate

Update an item in a list:

```typescript
const updated = createOptimisticListUpdate(
  items,
  itemId,
  { status: 'inactive' },
  'id' // idField
);
```

#### createOptimisticListRemoval

Remove an item from a list:

```typescript
const updated = createOptimisticListRemoval(
  items,
  itemId,
  'id' // idField
);
```

#### createOptimisticListAddition

Add an item to the beginning of a list:

```typescript
const updated = createOptimisticListAddition(items, newItem);
```

## Hook APIs

### useOptimisticReservations

```typescript
const {
  reservations,                    // Current reservations array
  setReservations,                 // Update reservations
  createReservationOptimistic,     // Create with optimistic update
  cancelReservationOptimistic,     // Cancel with optimistic update
} = useOptimisticReservations();
```

### useOptimisticPantryCart

```typescript
const {
  cart,                            // Current cart items
  setCart,                         // Update cart
  addItemOptimistic,               // Add item with optimistic update
  removeItemOptimistic,            // Remove item with optimistic update
  updateQuantityOptimistic,        // Update quantity with optimistic update
  clearCartOptimistic,             // Clear cart with optimistic update
} = useOptimisticPantryCart();
```

### useOptimisticNotifications

```typescript
const {
  notifications,                   // Current notifications array
  setNotifications,                // Update notifications
  markAsReadOptimistic,            // Mark as read with optimistic update
  deleteNotificationOptimistic,    // Delete with optimistic update
  unreadCount,                     // Current unread count
  updateUnreadCount,               // Update unread count
} = useOptimisticNotifications();
```

## Error Handling

All optimistic update operations automatically rollback on failure:

```typescript
try {
  await createReservationOptimistic(listing, quantity, apiCall);
} catch (error) {
  // UI has already been rolled back
  // Show error message to user
  showToast('Reservation failed', 'error');
}
```

## Best Practices

1. **Always provide error feedback** - Show toast or error message when operations fail
2. **Disable UI during operations** - Prevent duplicate submissions while API call is pending
3. **Validate before optimistic update** - Check data validity before updating UI
4. **Use appropriate idField** - Specify correct ID field when using list utilities
5. **Handle edge cases** - Consider what happens if user navigates away during operation

## Testing

All optimistic update utilities and hooks include comprehensive unit tests:

```bash
npm test -- --run src/utils/optimisticUpdates.test.ts
npm test -- --run src/hooks/useOptimisticReservations.test.ts
npm test -- --run src/hooks/useOptimisticPantryCart.test.ts
npm test -- --run src/hooks/useOptimisticNotifications.test.ts
```

## Requirements Coverage

- **Requirement 5.4**: Reservation quantity updates immediately
- **Requirement 6.3**: Pantry cart changes update immediately
- **Requirement 8.2**: Notifications marked as read immediately

## Performance Considerations

- Optimistic updates reduce perceived latency
- UI feels responsive even with slow network
- Automatic rollback prevents data inconsistency
- No additional API calls required for rollback
