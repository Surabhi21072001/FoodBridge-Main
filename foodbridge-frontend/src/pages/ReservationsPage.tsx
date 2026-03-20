import React, { useEffect, useState } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import listingsService from '../services/listingsService';
import eventsService from '../services/eventsService';
import type { Reservation, Listing } from '../types';
import type { VolunteerParticipation } from '../types/events';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Button from '../components/shared/Button';
import Card, { CardBody, CardHeader } from '../components/shared/Card';

const ReservationsPage: React.FC = () => {
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [listings, setListings] = useState<Map<string, Listing>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'picked_up' | 'cancelled' | 'no_show'>('all');
  const [volunteerSignups, setVolunteerSignups] = useState<VolunteerParticipation[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!user?.id) { setVolunteersLoading(false); return; }
    eventsService.getStudentVolunteerHistory(user.id)
      .then((data) => setVolunteerSignups(Array.isArray(data) ? data : []))
      .catch(() => setVolunteerSignups([]))
      .finally(() => setVolunteersLoading(false));
  }, [user?.id]);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      
      // Use the api service which handles auth properly
      const result = await api.get<any>('/reservations');
      const data = result?.data || [];
      setReservations(data);

      // Fetch listing details for each reservation
      const listingMap = new Map<string, Listing>();
      for (const reservation of data) {
        if (!listingMap.has(reservation.listing_id)) {
          try {
            const listing = await listingsService.getListingById(reservation.listing_id);
            listingMap.set(reservation.listing_id, listing);
          } catch (error) {
            console.error(`Failed to fetch listing ${reservation.listing_id}:`, error);
          }
        }
      }
      setListings(listingMap);
    } catch (error) {
      showToast('Failed to load reservations', 'error');
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await api.delete(`/reservations/${reservationId}`);
      showToast('Reservation cancelled successfully', 'success');
      fetchReservations();
    } catch (error) {
      showToast('Failed to cancel reservation', 'error');
      console.error('Error cancelling reservation:', error);
    }
  };

  const handleCancelVolunteer = async (participationId: string) => {
    if (!window.confirm('Cancel this volunteer signup?')) return;
    try {
      await eventsService.cancelVolunteerSignup(participationId);
      showToast('Volunteer signup cancelled', 'success');
      if (user?.id) {
        const data = await eventsService.getStudentVolunteerHistory(user.id);
        setVolunteerSignups(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      showToast('Failed to cancel volunteer signup', 'error');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="mt-2 text-gray-600">View and manage your food reservations</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'picked_up', 'cancelled', 'no_show'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-lg text-gray-600">
              {reservations.length === 0
                ? 'No reservations yet. Start by browsing food listings!'
                : 'No reservations match the selected filter.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const listing = listings.get(reservation.listing_id);
            return (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {listing?.food_name || 'Unknown Food'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Reservation ID: {reservation.id}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardHeader>

                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quantity */}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quantity</p>
                      <p className="text-lg font-semibold text-gray-900">{reservation.quantity}</p>
                    </div>

                    {/* Confirmation Code */}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confirmation Code</p>
                      <p className="text-lg font-mono text-gray-900">
                        {reservation.confirmation_code || 'N/A'}
                      </p>
                    </div>

                    {/* Reserved Date */}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reserved On</p>
                      <p className="text-gray-900">{formatDateTime(reservation.created_at)}</p>
                    </div>

                    {/* Pickup Location */}
                    {listing && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pickup Location</p>
                        <p className="text-gray-900">{listing.location}</p>
                      </div>
                    )}

                    {/* Pickup Window */}
                    {listing && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Pickup Window</p>
                        <p className="text-gray-900">
                          {formatDateTime(listing.pickup_window_start)} to{' '}
                          {new Date(listing.pickup_window_end).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dietary Tags */}
                  {listing?.dietary_tags && listing.dietary_tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Dietary Information</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.dietary_tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-green-50 text-green-700 rounded border border-green-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>

                {/* Actions */}
                {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                  <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancel(reservation.id)}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Volunteer Signups */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Volunteer Signups</h2>
        {volunteersLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
        ) : volunteerSignups.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-gray-600">No volunteer signups yet.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {volunteerSignups.map((signup) => (
              <Card key={signup.participation_id}>
                <CardBody>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0" style={{ backgroundColor: '#2a7c6f' }}>🤝</div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {signup.opportunity?.title || 'Volunteer Shift'}
                        </p>
                        {signup.opportunity?.event_date && (
                          <p className="text-sm text-gray-500">
                            {new Date(signup.opportunity.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        signup.status === 'signed_up' ? 'bg-green-100 text-green-800' :
                        signup.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {signup.status.replace('_', ' ')}
                      </span>
                      {signup.status === 'signed_up' && (
                        <Button variant="secondary" size="sm" onClick={() => handleCancelVolunteer(signup.participation_id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
