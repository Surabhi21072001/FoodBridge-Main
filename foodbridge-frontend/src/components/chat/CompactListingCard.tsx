import React from 'react';
import type { Listing } from '../../types';

export interface CompactListingCardProps {
  listing: Listing;
}

/**
 * Compact version of ListingCard for displaying in chat results.
 * Shows essential information in a condensed format suitable for chat display.
 * Requirement 10.6: Display tool results in a formatted manner
 */
const CompactListingCard: React.FC<CompactListingCardProps> = ({ listing }) => {
  // Format pickup window
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const pickupDate = formatDate(listing.pickup_window_start);
  const pickupStartTime = formatTime(listing.pickup_window_start);
  const pickupEndTime = formatTime(listing.pickup_window_end);

  return (
    <div
      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
      data-testid={`compact-listing-card-${listing.listing_id}`}
    >
      {/* Header with food name and type */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {listing.food_name}
          </h4>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap flex-shrink-0">
            {listing.listing_type}
          </span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-1">{listing.description}</p>
      </div>

      {/* Dietary tags */}
      {listing.dietary_tags && listing.dietary_tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {listing.dietary_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-1.5 py-0.5 text-xs bg-green-50 text-green-700 rounded border border-green-200"
            >
              {tag}
            </span>
          ))}
          {listing.dietary_tags.length > 3 && (
            <span className="text-xs text-gray-500">+{listing.dietary_tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Location and quantity info */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <span>📍</span>
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <span>📦</span>
          <span>
            {listing.available_quantity} of {listing.quantity} available
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <span>🕐</span>
          <span>
            {pickupDate} {pickupStartTime} - {pickupEndTime}
          </span>
        </div>
      </div>

      {/* Availability indicator */}
      {listing.available_quantity === 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
          Sold Out
        </div>
      )}
    </div>
  );
};

export default CompactListingCard;
