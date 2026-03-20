import React from 'react';
import type { Reservation } from '../../types/reservations';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ProviderReservationsSectionProps {
  reservations: Reservation[];
  loading: boolean;
}

const statusStyle = (status: Reservation['status']) => {
  switch (status) {
    case 'confirmed': return { backgroundColor: '#dcfce7', color: '#16a34a' };
    case 'picked_up': return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
    case 'cancelled': return { backgroundColor: '#fee2e2', color: '#dc2626' };
    default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ProviderReservationsSection: React.FC<ProviderReservationsSectionProps> = ({ reservations, loading }) => (
  <div className="rounded-2xl bg-white overflow-hidden h-full" style={{ border: '1px solid #e8d5c0' }}>
    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0e0cc' }}>
      <h2 className="font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.2rem', color: '#2d2d2d' }}>
        Recent Reservations
      </h2>
    </div>
    <div className="p-5">
      {loading ? (
        <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
      ) : reservations.length > 0 ? (
        <div className="space-y-3">
          {reservations.map((r, idx) => (
            <div
              key={r.id ?? idx}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#fdf6ee' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                style={{ backgroundColor: '#ff6b35' }}
              >
                🍱
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#2d2d2d' }}>
                  {r.listing?.food_name || 'Food Item'}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {r.quantity} · {formatDate(r.created_at)}
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full" style={statusStyle(r.status)}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-6">No reservations yet.</p>
      )}
    </div>
  </div>
);

export default ProviderReservationsSection;
