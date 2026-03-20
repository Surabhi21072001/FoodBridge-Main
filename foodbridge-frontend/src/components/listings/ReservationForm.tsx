import React, { useState } from 'react';
import type { Listing } from '../../types';
import Button from '../shared/Button';
import Input from '../shared/Input';

export interface ReservationFormProps {
  listing: Listing;
  onSubmit: (quantity: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  listing,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(quantity);
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-1">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={listing.available_quantity}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
          onClick={onCancel}
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
  );
};

export default ReservationForm;
