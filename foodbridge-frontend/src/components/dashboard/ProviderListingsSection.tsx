import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '../../types/listings';
import type { User } from '../../types/auth';
import ListingCard from '../listings/ListingCard';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ProviderListingsSectionProps {
  listings: Listing[];
  loading: boolean;
  user: User | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

const ProviderListingsSection: React.FC<ProviderListingsSectionProps> = ({
  listings,
  loading,
  user,
  onEdit,
  onDelete,
  onCreateClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.3rem', color: '#2d2d2d' }}>
          Your Active Listings
        </h2>
        <button onClick={() => navigate('/listings')} className="text-sm font-medium hover:opacity-80" style={{ color: '#ff6b35' }}>
          View All →
        </button>
      </div>
      <div className="px-6 pb-6">
        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.listing_id} style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <ListingCard
                  listing={listing}
                  currentUser={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No active listings yet.</p>
            <button
              onClick={onCreateClick}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Create Your First Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderListingsSection;
