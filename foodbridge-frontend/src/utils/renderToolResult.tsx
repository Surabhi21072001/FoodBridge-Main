import React from 'react';
import type { Listing } from '../types/listings';
import type { Notification } from '../types/notifications';
import CompactListingCard from '../components/chat/CompactListingCard';
import CompactNotificationItem from '../components/chat/CompactNotificationItem';
import CompactPantryCart from '../components/chat/CompactPantryCart';
import CompactAppointmentSlots from '../components/chat/CompactAppointmentSlots';

/**
 * Renders tool results in a formatted manner suitable for chat display.
 * Handles different result types (listings, notifications, pantry items, slots, etc.)
 * and displays them using compact component versions.
 * 
 * Requirement 10.6: Display tool results in a formatted manner
 */
export const renderToolResult = (toolName: string, result: any): React.ReactNode => {
  if (result === null || result === undefined) {
    return 'No result';
  }

  // Handle search_food_listings results - only if it looks like listing objects
  if (
    (toolName === 'search_food_listings' ||
      toolName === 'get_listings' ||
      toolName === 'get_event_food') &&
    isListingsResult(result)
  ) {
    return renderListingsResult(result);
  }

  // Handle get_notifications results - only if it looks like notification objects
  if (toolName === 'get_notifications' && isNotificationsResult(result)) {
    return renderNotificationsResult(result);
  }

  // Handle pantry-related results
  if (
    (toolName === 'get_pantry_inventory' || toolName === 'get_available_slots') &&
    isPantryResult(toolName, result)
  ) {
    return renderPantryResult(toolName, result);
  }

  // Handle generate_smart_cart results
  if (toolName === 'generate_smart_cart' && isCartResult(result)) {
    return renderSmartCartResult(result);
  }

  // Handle reservation confirmation results
  if (
    (toolName === 'reserve_food' || toolName === 'create_reservation') &&
    isReservationResult(result)
  ) {
    return renderReservationResult(result);
  }

  // Handle appointment booking results
  if (
    (toolName === 'book_pantry_appointment' || toolName === 'book_appointment') &&
    isAppointmentResult(result)
  ) {
    return renderAppointmentResult(result);
  }

  // Handle volunteer signup results
  if (toolName === 'sign_up_for_volunteer' && isVolunteerResult(result)) {
    return renderVolunteerResult(result);
  }

  // Default: render as formatted JSON
  return renderDefaultResult(result);
};

/**
 * Type guard functions to determine if result matches expected structure
 */
const isListingsResult = (result: any): boolean => {
  if (!result) return false;
  const listings = Array.isArray(result)
    ? result
    : result.data || result.listings || [];
  return (
    Array.isArray(listings) &&
    listings.length > 0 &&
    typeof listings[0] === 'object' &&
    'listing_id' in listings[0]
  );
};

const isNotificationsResult = (result: any): boolean => {
  if (!result) return false;
  const notifications = Array.isArray(result)
    ? result
    : result.data || result.notifications || [];
  return (
    Array.isArray(notifications) &&
    notifications.length > 0 &&
    typeof notifications[0] === 'object' &&
    'notification_id' in notifications[0]
  );
};

const isPantryResult = (toolName: string, result: any): boolean => {
  if (!result) return false;
  if (toolName === 'get_available_slots') {
    const slots = Array.isArray(result) ? result : result.data || result.slots || [];
    return (
      Array.isArray(slots) &&
      slots.length > 0 &&
      typeof slots[0] === 'object' &&
      'slot_id' in slots[0]
    );
  }
  // For inventory, check if it has item_id or item_name
  const items = Array.isArray(result) ? result : result.data || result.items || [];
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    typeof items[0] === 'object' &&
    ('item_id' in items[0] || 'item_name' in items[0])
  );
};

const isCartResult = (result: any): boolean => {
  if (!result) return false;
  const items = Array.isArray(result)
    ? result
    : result.data || result.items || result.recommendations || [];
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    typeof items[0] === 'object' &&
    'item_id' in items[0]
  );
};

const isReservationResult = (result: any): boolean => {
  if (!result) return false;
  return (
    typeof result === 'object' &&
    ('reservation_id' in result || 'reservation' in result)
  );
};

const isAppointmentResult = (result: any): boolean => {
  if (!result) return false;
  return (
    typeof result === 'object' &&
    ('appointment_id' in result || 'appointment' in result)
  );
};

const isVolunteerResult = (result: any): boolean => {
  if (!result) return false;
  return (
    typeof result === 'object' &&
    ('opportunity_id' in result || 'opportunity' in result)
  );
};

/**
 * Renders food listings using compact listing cards
 */
const renderListingsResult = (result: any): React.ReactNode => {
  // Handle paginated response
  const listings = Array.isArray(result)
    ? result
    : result.data || result.listings || [];

  if (!Array.isArray(listings) || listings.length === 0) {
    return <div className="text-sm text-gray-600">No listings found</div>;
  }

  return (
    <div className="space-y-2 mt-2" data-testid="listings-result">
      {listings.slice(0, 5).map((listing: Listing) => (
        <CompactListingCard key={listing.listing_id} listing={listing} />
      ))}
      {listings.length > 5 && (
        <div className="text-xs text-gray-500 text-center py-2">
          +{listings.length - 5} more listings
        </div>
      )}
    </div>
  );
};

/**
 * Renders notifications using compact notification items
 */
const renderNotificationsResult = (result: any): React.ReactNode => {
  const notifications = Array.isArray(result)
    ? result
    : result.data || result.notifications || [];

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return <div className="text-sm text-gray-600">No notifications</div>;
  }

  return (
    <div className="space-y-2 mt-2" data-testid="notifications-result">
      {notifications.slice(0, 5).map((notification: Notification) => (
        <CompactNotificationItem
          key={notification.notification_id}
          notification={notification}
        />
      ))}
      {notifications.length > 5 && (
        <div className="text-xs text-gray-500 text-center py-2">
          +{notifications.length - 5} more notifications
        </div>
      )}
    </div>
  );
};

/**
 * Renders pantry-related results (inventory or slots)
 */
const renderPantryResult = (toolName: string, result: any): React.ReactNode => {
  if (toolName === 'get_available_slots') {
    return renderSlotsResult(result);
  }

  // Inventory result
  const items = Array.isArray(result)
    ? result
    : result.data || result.items || result.inventory || [];

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="text-sm text-gray-600">No items available</div>;
  }

  return (
    <div className="text-sm text-gray-700 mt-2" data-testid="pantry-inventory-result">
      <div className="space-y-1">
        {items.slice(0, 8).map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-medium">{item.item_name || item.name}</span>
            <span className="text-xs text-gray-600">
              {item.quantity} {item.unit || 'units'}
            </span>
          </div>
        ))}
        {items.length > 8 && (
          <div className="text-xs text-gray-500 text-center py-2">
            +{items.length - 8} more items
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Renders available appointment slots
 */
const renderSlotsResult = (result: any): React.ReactNode => {
  const slots = Array.isArray(result)
    ? result
    : result.data || result.slots || [];

  if (!Array.isArray(slots) || slots.length === 0) {
    return <div className="text-sm text-gray-600">No available slots</div>;
  }

  return (
    <CompactAppointmentSlots slots={slots} />
  );
};

/**
 * Renders smart cart recommendations
 */
const renderSmartCartResult = (result: any): React.ReactNode => {
  const items = Array.isArray(result)
    ? result
    : result.data || result.items || result.recommendations || [];

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="text-sm text-gray-600">No recommendations available</div>;
  }

  return (
    <CompactPantryCart items={items} />
  );
};

/**
 * Renders reservation confirmation
 */
const renderReservationResult = (result: any): React.ReactNode => {
  if (!result) {
    return <div className="text-sm text-gray-600">Reservation failed</div>;
  }

  const reservation = result.reservation || result;
  const quantity = reservation.quantity || result.quantity;
  const listingName = reservation.listing?.food_name || result.food_name || 'Food item';

  return (
    <div
      className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm"
      data-testid="reservation-result"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">✅</span>
        <div>
          <p className="font-semibold text-green-900">Reservation Confirmed</p>
          <p className="text-green-800 mt-1">
            {quantity} {quantity === 1 ? 'item' : 'items'} of <strong>{listingName}</strong> reserved
          </p>
          {reservation.reservation_id && (
            <p className="text-xs text-green-700 mt-1">
              Reservation ID: {reservation.reservation_id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Renders appointment booking confirmation
 */
const renderAppointmentResult = (result: any): React.ReactNode => {
  if (!result) {
    return <div className="text-sm text-gray-600">Appointment booking failed</div>;
  }

  const appointment = result.appointment || result;
  const slotTime = appointment.slot?.slot_time || appointment.slot_time || 'Unknown time';

  const formatSlotTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm"
      data-testid="appointment-result"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">✅</span>
        <div>
          <p className="font-semibold text-green-900">Appointment Booked</p>
          <p className="text-green-800 mt-1">
            Slot: <strong>{formatSlotTime(slotTime)}</strong>
          </p>
          {appointment.appointment_id && (
            <p className="text-xs text-green-700 mt-1">
              Appointment ID: {appointment.appointment_id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Renders volunteer signup confirmation
 */
const renderVolunteerResult = (result: any): React.ReactNode => {
  if (!result) {
    return <div className="text-sm text-gray-600">Volunteer signup failed</div>;
  }

  const opportunity = result.opportunity || result;
  const title = opportunity.title || result.title || 'Volunteer opportunity';

  return (
    <div
      className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm"
      data-testid="volunteer-result"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">✅</span>
        <div>
          <p className="font-semibold text-green-900">Signed Up Successfully</p>
          <p className="text-green-800 mt-1">
            You've signed up for <strong>{title}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Default rendering for unknown result types
 */
const renderDefaultResult = (result: any): React.ReactNode => {
  if (typeof result === 'string') {
    return <div className="text-sm text-gray-700">{result}</div>;
  }

  if (typeof result === 'number' || typeof result === 'boolean') {
    return <div className="text-sm text-gray-700">{String(result)}</div>;
  }

  if (Array.isArray(result)) {
    if (result.length === 0) {
      return <div className="text-sm text-gray-700">Empty list</div>;
    }
    return (
      <div className="text-sm text-gray-700 mt-2">
        <ul className="list-disc list-inside space-y-1">
          {result.slice(0, 10).map((item, idx) => (
            <li key={idx}>
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </li>
          ))}
          {result.length > 10 && (
            <li className="text-gray-500">+{result.length - 10} more items</li>
          )}
        </ul>
      </div>
    );
  }

  if (typeof result === 'object') {
    return (
      <div className="text-sm text-gray-700 mt-2 space-y-1">
        {Object.entries(result)
          .slice(0, 10)
          .map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="text-gray-700">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        {Object.keys(result).length > 10 && (
          <div className="text-gray-500 text-xs">
            +{Object.keys(result).length - 10} more fields
          </div>
        )}
      </div>
    );
  }

  return <div className="text-sm text-gray-600">Result: {String(result)}</div>;
};
