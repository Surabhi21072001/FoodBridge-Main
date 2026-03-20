import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import listingsService from '../../services/listingsService';
import pantryService from '../../services/pantryService';
import notificationsService from '../../services/notificationsService';
import type { Listing } from '../../types/listings';
import type { Reservation } from '../../types/reservations';
import type { Appointment } from '../../types/pantry';
import type { Notification } from '../../types/notifications';
import Button from '../shared/Button';
import ListingCard from '../listings/ListingCard';
import LoadingSpinner from '../shared/LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToastContext();

  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        setListingsLoading(true);
        const response = await listingsService.getListings({ page: 1, limit: 3 });
        setRecentListings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch recent listings:', error);
        toast.error('Failed to load recent listings');
      } finally {
        setListingsLoading(false);
      }
    };
    fetchRecentListings();
  }, [location]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.id) { setReservationsLoading(false); return; }
      try {
        setReservationsLoading(true);
        const result = await api.get<any>('/reservations');
        const data = result?.data || [];
        const active = (Array.isArray(data) ? data : []).filter(
          (r) => r.status === 'confirmed' || r.status === 'pending'
        );
        const enriched = await Promise.all(
          active.slice(0, 3).map(async (r) => {
            try { return { ...r, listing: await listingsService.getListingById(r.listing_id) }; }
            catch { return r; }
          })
        );
        setReservations(enriched);
      } catch { setReservations([]); }
      finally { setReservationsLoading(false); }
    };
    fetchReservations();
  }, [user?.id]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) { setAppointmentsLoading(false); return; }
      try {
        setAppointmentsLoading(true);
        const data = await pantryService.getStudentAppointments(user.id);
        setAppointments((Array.isArray(data) ? data : []).filter((a) => a.status === 'scheduled').slice(0, 3));
      } catch { setAppointments([]); }
      finally { setAppointmentsLoading(false); }
    };
    fetchAppointments();
  }, [user?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) { setNotificationsLoading(false); return; }
      try {
        setNotificationsLoading(true);
        const data = await notificationsService.getNotifications(user.id);
        setNotifications((Array.isArray(data) ? data : []).slice(0, 3));
      } catch { setNotifications([]); }
      finally { setNotificationsLoading(false); }
    };
    fetchNotifications();
  }, [user?.id]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={{ backgroundColor: '#f5e6d3', minHeight: '100vh' }}>

      {/* Hero - split layout: text left, image right */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: '#2d2d2d', minHeight: '280px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
      >
        {/* Left: text */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ff6b35' }}>
            Campus Food Platform
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}
          >
            Welcome back,<br />{user?.email ? user.email.split('@')[0].split('.')[0].replace(/\b\w/g, c => c.toUpperCase()) : 'there'}!
          </h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Discover surplus food, manage your reservations, and book pantry appointments — all in one place.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/listings')}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Browse Food
            </button>
            <button
              onClick={() => navigate('/pantry')}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border text-white hover:bg-white hover:text-gray-900 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Book Pantry
            </button>
          </div>
        </div>
        {/* Right: image */}
        <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
          <img
            src="/hero-food.jpg"
            alt="Food"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
        </div>
      </div>

      {/* Recent Listings */}
      <div className="rounded-3xl mb-6 overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.3rem', color: '#2d2d2d' }}>
            Recent Food Listings
          </h2>
          <button onClick={() => navigate('/listings')} className="text-sm font-medium hover:opacity-80" style={{ color: '#ff6b35' }}>
            View All →
          </button>
        </div>
        <div className="px-6 pb-6">
          {listingsLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentListings.map((listing) => (
                <div key={listing.listing_id} className="h-full" style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  <ListingCard listing={listing} currentUser={user} onReserve={(id) => navigate(`/listings/${id}`)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No food listings available right now</p>
              <Button variant="primary" size="md" onClick={() => navigate('/listings')}>Browse All Listings</Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom split: reservations + appointments */}
      <div className="rounded-3xl mb-6 overflow-hidden" style={{ backgroundColor: '#f5e6d3', padding: '16px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reservations */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #e8d5c0' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0e0cc' }}>
            <h2 className="text-base font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.2rem', color: '#2d2d2d' }}>
              Upcoming Reservations
            </h2>
            <button onClick={() => navigate('/reservations')} className="text-sm font-medium" style={{ color: '#ff6b35' }}>View All →</button>
          </div>
          <div className="p-5">
            {reservationsLoading ? <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
              : reservations.length > 0 ? (
                <div className="space-y-3">
                  {reservations.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#fdf6ee' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0" style={{ backgroundColor: '#ff6b35' }}>🍱</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: '#2d2d2d' }}>{r.listing?.food_name || 'Food Item'}</p>
                        <p className="text-xs text-gray-500">Qty: {r.quantity}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">No active reservations</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/listings')}>Make a Reservation</Button>
                </div>
              )}
          </div>
        </div>

        {/* Appointments */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #e8d5c0' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0e0cc' }}>
            <h2 className="text-base font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.2rem', color: '#2d2d2d' }}>
              Pantry Appointments
            </h2>
            <button onClick={() => navigate('/pantry')} className="text-sm font-medium" style={{ color: '#ff6b35' }}>View All →</button>
          </div>
          <div className="p-5">
            {appointmentsLoading ? <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
              : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#fdf6ee' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0" style={{ backgroundColor: '#2a7c6f' }}>📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>Pantry Appointment</p>
                        {a.appointment_time && <p className="text-xs text-gray-500">{formatTime(a.appointment_time)}</p>}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">No upcoming appointments</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/pantry')}>Book an Appointment</Button>
                </div>
              )}
          </div>
        </div>

        </div>
      </div>

      {/* Community / Notifications split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community card with image */}
        <div className="rounded-2xl overflow-hidden" style={{ minHeight: '320px', backgroundColor: '#2d2d2d', position: 'relative', padding: '36px 36px 40px 36px' }}>
          <img src="/hero-food.jpg" alt="community" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}>Community Impact</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-5 max-w-xs">
              Join students making a difference by reducing food waste and supporting each other on campus.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Get Involved
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-base font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', color: '#2d2d2d', fontSize: '1.2rem' }}>
              Recent Notifications
            </h2>
            <button onClick={() => navigate('/notifications')} className="text-sm font-medium" style={{ color: '#ff6b35' }}>View All →</button>
          </div>
          <div className="px-5 pb-5">
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px' }}>
            {notificationsLoading ? <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
              : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: n.is_read ? '#fdf6ee' : '#fff3e8', borderLeft: n.is_read ? 'none' : '3px solid #ff6b35' }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: n.is_read ? '#f0e0cc' : '#ff6b35', color: n.is_read ? '#2d2d2d' : 'white' }}>
                        🔔
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: '#2d2d2d' }}>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
