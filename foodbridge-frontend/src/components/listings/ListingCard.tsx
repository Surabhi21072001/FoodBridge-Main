import React from 'react';
import type { Listing, User } from '../../types';
import Button from '../shared/Button';
import LazyImage from '../shared/LazyImage';
import { generateListingImageUrl } from '../../utils/imageGenerator';

export interface ListingCardProps {
  listing: Listing;
  currentUser?: User | null;
  isProviderOwned?: boolean;
  onReserve?: (listingId: string) => void;
  onEdit?: (listingId: string) => void;
  onDelete?: (listingId: string) => void;
  onFilterByDietary?: (dietary: string) => void;
}

const TYPE_STYLES: Record<string, string> = {
  donation: 'bg-emerald-100 text-emerald-700',
  event: 'bg-violet-100 text-violet-700',
  dining_deal: 'bg-amber-100 text-amber-700',
};

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  currentUser,
  isProviderOwned = false,
  onReserve,
  onEdit,
  onDelete,
  onFilterByDietary,
}) => {
  const isProvider = currentUser?.role === 'provider';
  // isProviderOwned is set by the parent when it knows all fetched listings belong to the provider
  // (e.g. from /listings/provider/my-listings). Falls back to ID comparison as a secondary check.
  const isOwnListing = isProviderOwned || (isProvider && !!currentUser?.id && currentUser.id === listing.provider_id);
  const isSoldOut = listing.available_quantity === 0;

  const s = new Date(listing.pickup_window_start);
  const e = new Date(listing.pickup_window_end);
  const pickupDate = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startTime = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endTime = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const pickupRange = startTime + ' - ' + endTime;

  const typeStyle = TYPE_STYLES[listing.listing_type] || 'bg-blue-100 text-blue-700';
  const availabilityPct = listing.quantity > 0 ? (listing.available_quantity / listing.quantity) * 100 : 0;
  const progressColor = availabilityPct > 50 ? '#22c55e' : availabilityPct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <div
      data-testid={`listing-card-${listing.listing_id}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden flex-shrink-0">
        <LazyImage
          src={listing.image_url || generateListingImageUrl(listing)}
          alt={listing.food_name}
          className="w-full h-full object-cover"
          placeholderClassName="w-full h-full bg-gray-200 animate-pulse"
        />
        <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full ${typeStyle}`}>
          {listing.listing_type.replace('_', ' ')}
        </span>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wide uppercase bg-black/60 px-3 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
            {listing.food_name}
          </h3>
          {listing.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{listing.description}</p>
          )}
        </div>

        {listing.dietary_tags && listing.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.dietary_tags.slice(0, 4).map((tag: string) => (
              <button
                key={tag}
                onClick={() => onFilterByDietary?.(tag)}
                className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
              >
                {tag}
              </button>
            ))}
            {listing.dietary_tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-gray-400">+{listing.dietary_tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="space-y-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0">&#128205;</span>
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">&#128336;</span>
            <span>{pickupDate} &middot; {pickupRange}</span>
          </div>
        </div>

        <div className="mt-auto pt-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{listing.available_quantity} of {listing.quantity} available</span>
            <span>{Math.round(availabilityPct)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: availabilityPct + '%', backgroundColor: progressColor }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {isOwnListing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit?.(listing.listing_id)}
                className="flex-1"
                data-testid={`edit-button-${listing.listing_id}`}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete?.(listing.listing_id)}
                className="flex-1"
                data-testid={`delete-button-${listing.listing_id}`}
              >
                Delete
              </Button>
            </>
          ) : !isProvider ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReserve?.(listing.listing_id)}
              disabled={isSoldOut}
              className="w-full"
              data-testid={`reserve-button-${listing.listing_id}`}
            >
              {isSoldOut ? 'Sold Out' : 'Reserve'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
