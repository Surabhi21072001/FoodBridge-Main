import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useToast from '../../hooks/useToast';
import reservationsService from '../../services/reservationsService';
import type { Reservation } from '../../types';
import Card, { CardBody } from '../shared/Card';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';

const ReservationsList: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);

  // Fetch user's reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const data = await reservationsService.getStudentReservations(user.id);
        setReservations(data);
      } catch (error) {
        showToast('Failed to load reservations', 'error');
        console.error('Error fetching reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [user?.id, showToast]);

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

  // Handle cancel reservation
  const handleCancelReservation = async (reservationId: string) => {
    try {
      setIsCanceling(reservationId);
      await reservationsService.cancelReservation(reservationId);
      setReservations((prev) =>
        prev.filter((r) => r.id !== reservationId)
      );
      showToast('Reservation canceled', 'success');
    } catch (error) {
      showToast('Failed to cancel reservation', 'error');
      console.error('Error canceling reservation:', error);
    } finally {
      setIsCanceling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-600 mb-2">No active reservations</p>
          <p className="text-sm text-gray-500">
            Browse food listings to make your first reservation
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Reservations</h2>
      <div className="space-y-3">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.quantity} unit{reservation.quantity !== 1 ? 's' : ''}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        reservation.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : reservation.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Listing ID: {reservation.listing_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Reserved on: {formatDateTime(reservation.created_at)}
                  </p>
                </div>
                {reservation.status === 'active' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelReservation(reservation.id)}
                    isLoading={isCanceling === reservation.id}
                    disabled={isCanceling !== null}
                    data-testid={`cancel-reservation-${reservation.id}`}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReservationsList;
