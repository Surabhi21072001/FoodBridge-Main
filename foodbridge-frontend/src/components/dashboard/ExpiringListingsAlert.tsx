import React from 'react';
import type { Listing } from '../../types/listings';

interface ExpiringListingsAlertProps {
  listings: Listing[];
}

const getTimeRemaining = (end: string): string => {
  const diff = new Date(end).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  return mins < 60 ? `${mins}m remaining` : `${Math.floor(mins / 60)}h ${mins % 60}m remaining`;
};

const ExpiringListingsAlert: React.FC<ExpiringListingsAlertProps> = ({ listings }) => {
  if (listings.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #fca5a5', backgroundColor: '#fff5f5' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ backgroundColor: '#fee2e2' }}>
        <span className="text-lg">⚠️</span>
        <h3 className="font-bold text-sm" style={{ color: '#dc2626' }}>
          {listings.length} listing{listings.length > 1 ? 's' : ''} expiring soon
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {listings.map((l) => (
          <div
            key={l.listing_id}
            className="flex items-center justify-between p-3 rounded-xl bg-white"
            style={{ border: '1px solid #fca5a5' }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{l.food_name}</p>
              <p className="text-xs text-gray-500">{l.location}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              {getTimeRemaining(l.pickup_window_end)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpiringListingsAlert;
