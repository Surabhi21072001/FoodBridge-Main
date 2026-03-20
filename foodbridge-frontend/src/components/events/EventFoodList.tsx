import React, { useState } from 'react';
import type { Listing, User } from '../../types';
import ListingCard from '../listings/ListingCard';
import Modal from '../shared/Modal';
import ReservationForm from '../listings/ReservationForm';
import useToast from '../../hooks/useToast';

export interface EventFoodListProps {
  listings: Listing[];
  currentUser?: User | null;
  isLoading?: boolean;
  onReservationSuccess?: () => void;
}

const EventFoodList: React.FC<EventFoodListProps> = ({
  listings,
  currentUser,
  isLoading = false,
  onReservationSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const handleReserve = (listingId: string) => {
    const listing = listings.find((l) => l.listing_id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setIsReservationModalOpen(true);
    }
  };

  const handleReservationSubmit = async (_quantity: number) => {
    if (!selectedListing) return;
    
    try {
      // The actual reservation is handled by the parent component or service
      // This just closes the modal and shows success
      setIsReservationModalOpen(false);
      setSelectedListing(null);
      showToast('Reservation successful!', 'success');
      onReservationSuccess?.();
    } catch (error) {
      showToast('Failed to complete reservation', 'error');
      console.error('Reservation error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsReservationModalOpen(false);
    setSelectedListing(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-600">No event food available at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.listing_id}
            listing={listing}
            currentUser={currentUser}
            onReserve={handleReserve}
            data-testid={`event-food-card-${listing.listing_id}`}
          />
        ))}
      </div>

      {/* Reservation Modal */}
      <Modal
        isOpen={isReservationModalOpen}
        onClose={handleCloseModal}
        title="Reserve Event Food"
      >
        {selectedListing && (
          <ReservationForm
            listing={selectedListing}
            onSubmit={handleReservationSubmit}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
};

export default EventFoodList;
