import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import listingsService from '../../services/listingsService';
import reservationsService from '../../services/reservationsService';
import type { Listing, Reservation } from '../../types';
import Card, { CardBody, CardFooter, CardHeader } from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';
import Modal from '../shared/Modal';

export interface ListingDetailProps {
  listingId: string;
  onClose?: () => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationQuantity, setReservationQuantity] = useState(1);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const isStudent = user?.role === 'student';
  const isProvider = user?.role === 'provider';
  const isOwnListing = isProvider && user?.id === listing?.provider_id;

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const data = await listingsService.getListingById(listingId);
        setListing(data);
      } catch (error) {
        showToast('Failed to load listing details', 'error');
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId, showToast]);

  // Fetch reservations for this listing (if provider)
  useEffect(() => {
    if (!isOwnListing || !listing) return;

    const fetchReservations = async () => {
      try {
        const data = await listingsService.getListingReservations(listingId);
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, [listingId, isOwnListing, listing, showToast]);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle reservation submission
  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing || reservationQuantity < 1 || reservationQuantity > listing.available_quantity) {
      showToast('Invalid quantity', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await reservationsService.createReservation({
        listing_id: listingId,
        quantity: reservationQuantity,
      });
      showToast('Reservation confirmed!', 'success');
      setShowReservationForm(false);
      setReservationQuantity(1);

      // Refresh listing to update available quantity
      const updatedListing = await listingsService.getListingById(listingId);
      if (updatedListing) {
        setListing(updatedListing);
      }
    } catch (error) {
      showToast('Failed to create reservation', 'error');
      console.error('Error creating reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-lg font-medium text-gray-900">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Listing Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{listing.food_name}</h1>
              <p className="mt-2 text-gray-600">{listing.description}</p>
            </div>
            <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
              {listing.listing_type}
            </span>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Dietary Tags */}
          {listing.dietary_tags && listing.dietary_tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {listing.dietary_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-sm bg-green-50 text-green-700 rounded border border-green-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">📍 Location</h3>
              <p className="text-gray-700">{listing.location}</p>
            </div>

            {/* Food Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">🍽️ Food Type</h3>
              <p className="text-gray-700">{listing.food_type}</p>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">📦 Quantity</h3>
              <p className="text-gray-700">
                {listing.available_quantity} of {listing.quantity} available
              </p>
              {listing.available_quantity === 0 && (
                <p className="text-sm text-red-600 mt-1">Sold out</p>
              )}
            </div>

            {/* Pickup Window */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">🕐 Pickup Window</h3>
              <p className="text-gray-700">
                {formatDateTime(listing.pickup_window_start)}
              </p>
              <p className="text-sm text-gray-600">
                to {formatTime(listing.pickup_window_end)}
              </p>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Status</h3>
              <p className="text-gray-700 capitalize">{listing.status}</p>
            </div>

            {/* Created Date */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Posted</h3>
              <p className="text-gray-700">{formatDateTime(listing.created_at)}</p>
            </div>
          </div>
        </CardBody>

        {/* Student Reservation Section */}
        {isStudent && listing.available_quantity > 0 && (
          <CardFooter>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowReservationForm(true)}
              className="w-full"
              data-testid="open-reservation-form-button"
            >
              Reserve This Food
            </Button>
          </CardFooter>
        )}

        {/* Sold Out Message */}
        {isStudent && listing.available_quantity === 0 && (
          <CardFooter>
            <div className="w-full text-center py-3 bg-red-50 rounded border border-red-200">
              <p className="text-red-700 font-medium">This listing is sold out</p>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Provider Reservations List */}
      {isOwnListing && reservations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Reservations ({reservations.length})</h2>
          </CardHeader>

          <CardBody>
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                  data-testid={`reservation-item-${reservation.id}`}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {reservation.quantity} unit{reservation.quantity !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reserved by: {reservation.user_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(reservation.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      reservation.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'picked_up'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Provider No Reservations Message */}
      {isOwnListing && reservations.length === 0 && (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-600">No reservations yet for this listing</p>
          </CardBody>
        </Card>
      )}

      {/* Reservation Form Modal */}
      <Modal
        isOpen={showReservationForm}
        onClose={() => setShowReservationForm(false)}
        title="Reserve Food"
        data-testid="reservation-form-modal"
      >
        <form onSubmit={handleReserveSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-1">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={listing.available_quantity}
              value={reservationQuantity}
              onChange={(e) => setReservationQuantity(parseInt(e.target.value) || 1)}
              data-testid="reservation-quantity-input"
            />
            <p className="mt-1 text-xs text-gray-600">
              Available: {listing.available_quantity} unit{listing.available_quantity !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-900">
              <strong>Pickup:</strong> {formatDateTime(listing.pickup_window_start)} to{' '}
              {formatTime(listing.pickup_window_end)}
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <strong>Location:</strong> {listing.location}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowReservationForm(false)}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="cancel-reservation-button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
              data-testid="confirm-reservation-button"
            >
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Button for Modal/Detail View */}
      {onClose && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            data-testid="close-detail-button"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
