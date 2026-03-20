import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import listingsService from '../../services/listingsService';
import reservationsService from '../../services/reservationsService';
import type { Listing } from '../../types/listings';
import type { Reservation } from '../../types/reservations';
import Modal from '../shared/Modal';
import CreateListingForm from '../listings/CreateListingForm';
import ProviderStatsCards from './ProviderStatsCards';
import ExpiringListingsAlert from './ExpiringListingsAlert';
import ProviderListingsSection from './ProviderListingsSection';
import ProviderReservationsSection from './ProviderReservationsSection';
import ActivityFeed, { type ActivityItem } from './ActivityFeed';

const EXPIRY_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastContext();

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const data = await listingsService.getProviderListings();
      setListings(data.filter((l) => l.status === 'active'));
    } catch {
      toast.error('Failed to load your listings');
    } finally {
      setListingsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    if (listings.length === 0) { setStatsLoading(false); return; }
    const fetchReservations = async () => {
      try {
        setStatsLoading(true);
        const results = await Promise.allSettled(
          listings.map((l) => reservationsService.getListingReservations(l.listing_id))
        );
        const all: Reservation[] = [];
        results.forEach((r) => { if (r.status === 'fulfilled') all.push(...r.value); });
        setAllReservations(
          all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
      } catch {
        toast.error('Failed to load reservation data');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchReservations();
  }, [listings, toast]);

  const handleEdit = (id: string) => navigate(`/listings/${id}/edit`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await listingsService.deleteListing(id);
      toast.success('Listing deleted');
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success('Listing created!');
    fetchListings();
  };

  // Derived stats
  const now = Date.now();
  const expiringSoon = listings.filter(
    (l) => new Date(l.pickup_window_end).getTime() - now <= EXPIRY_WINDOW_MS &&
            new Date(l.pickup_window_end).getTime() > now
  );
  const claimedToday = allReservations.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;

  // Activity feed — derive from reservations + listings
  const activityItems: ActivityItem[] = [
    ...allReservations.slice(0, 8).map((r) => ({
      id: r.id,
      message: `Student reserved ${r.quantity}x ${r.listing?.food_name || 'a food item'}`,
      time: r.created_at,
      icon: '🎟️',
    })),
    ...listings.slice(0, 3).map((l) => ({
      id: `listing-${l.listing_id}`,
      message: `Listing "${l.food_name}" is active`,
      time: l.created_at,
      icon: '📋',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  const firstName = user?.email
    ? user.email.split('@')[0].split('.')[0].replace(/\b\w/g, (c) => c.toUpperCase())
    : 'there';

  return (
    <div style={{ backgroundColor: '#f5e6d3', minHeight: '100vh' }}>

      {/* Hero */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: '#2d2d2d', minHeight: '280px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
      >
        <div className="flex flex-col justify-center p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ff6b35' }}>
            Provider Portal
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif' }}
          >
            Welcome back,<br />{firstName}!
          </h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Manage your food listings, track reservations, and make an impact on campus food access.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#ff6b35' }}
            >
              ➕ Create Listing
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
          <img src="/hero-food.jpg" alt="Food" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4">
        <ProviderStatsCards
        activeListings={listings.length}
        totalReservations={allReservations.length}
        claimedToday={claimedToday}
        expiringSoon={expiringSoon.length}
        loading={statsLoading || listingsLoading}
      />
      </div>

      {/* Expiring alert */}
      {expiringSoon.length > 0 && (
        <div className="mt-6">
          <ExpiringListingsAlert listings={expiringSoon} />
        </div>
      )}

      {/* Listings */}
      <div className="mt-6">
        <ProviderListingsSection
          listings={listings}
          loading={listingsLoading}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateClick={() => setShowCreateModal(true)}
        />
      </div>

      {/* Reservations + Activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 px-4">
        <ProviderReservationsSection
          reservations={allReservations.slice(0, 6)}
          loading={statsLoading}
        />
        <ActivityFeed items={activityItems} />
      </div>

      {/* Create Listing Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Food Listing" className="max-w-2xl">
        <CreateListingForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ProviderDashboard;
