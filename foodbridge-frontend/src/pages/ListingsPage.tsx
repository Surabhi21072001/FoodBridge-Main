import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useToast from '../hooks/useToast';
import useListingsPolling from '../hooks/useListingsPolling';
import listingsService from '../services/listingsService';
import type { Listing, ListingQueryParams, FilterState } from '../types/listings';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ListingSearchBar from '../components/listings/ListingSearchBar';
import ListingFilters from '../components/listings/ListingFilters';
import ListingCard from '../components/listings/ListingCard';
import ListingDetail from '../components/listings/ListingDetail';
import Modal from '../components/shared/Modal';
import Button from '../components/shared/Button';
import CreateListingForm from '../components/listings/CreateListingForm';
import EditListingForm from '../components/listings/EditListingForm';

const LISTINGS_PER_PAGE = 20;

const ListingsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { id: listingId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    dietary: [],
    location: '',
    food_type: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const listingsMapRef = useRef<Map<string, Listing>>(new Map());

  const isProvider = user?.role === 'provider';
  const showProviderListings = isProvider;

  // Core fetch function — for providers uses the dedicated /provider/my-listings endpoint
  // (avoids any stale closure / sessionStorage shape issues with provider_id filtering)
  const fetchListings = useCallback(
    async (
      page: number = 1,
      reset: boolean = false,
      search: string = '',
      currentFilters: FilterState = { dietary: [], location: '', food_type: '' },
      forProvider: boolean = false
    ) => {
      try {
        if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        let newListings: Listing[] = [];
        let pagination: { total_count: number; page: number; limit: number; total_pages: number } | undefined;

        if (forProvider) {
          // Use the JWT-authenticated provider endpoint — no need for user.id
          newListings = await listingsService.getProviderListings();
          pagination = { total_count: newListings.length, page: 1, limit: newListings.length, total_pages: 1 };
        } else {
          const params: ListingQueryParams = {
            page,
            limit: LISTINGS_PER_PAGE,
            search: search || undefined,
            dietary: currentFilters.dietary.length > 0 ? currentFilters.dietary : undefined,
            location: currentFilters.location || undefined,
            food_type: currentFilters.food_type || undefined,
          };
          const response = await listingsService.getListings(params);
          newListings = response?.data || [];
          pagination = response?.pagination;
        }

        if (reset || page === 1) {
          setListings(newListings);
          listingsMapRef.current.clear();
          newListings.forEach((l) => listingsMapRef.current.set(l.listing_id, l));
        } else {
          setListings((prev) => [...prev, ...newListings]);
          newListings.forEach((l) => listingsMapRef.current.set(l.listing_id, l));
        }

        setCurrentPage(page);
        setTotalCount(pagination?.total_count || 0);
        setHasMore(forProvider ? false : page < (pagination?.total_pages || 1));
      } catch (error) {
        showToast('Failed to load listings', 'error');
        console.error('Error fetching listings:', error);
        if (page === 1) setListings([]);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [showToast]
  );

  // Handle real-time updates from polling
  const handleListingsUpdate = useCallback((updatedListings: Listing[]) => {
    setListings((prevListings) => {
      const updatedMap = new Map<string, Listing>();
      updatedListings.forEach((l) => updatedMap.set(l.listing_id, l));
      const merged = prevListings.map((listing) => {
        const updated = updatedMap.get(listing.listing_id);
        return updated
          ? { ...listing, available_quantity: updated.available_quantity, quantity: updated.quantity, status: updated.status, updated_at: updated.updated_at }
          : listing;
      });
      merged.forEach((l) => listingsMapRef.current.set(l.listing_id, l));
      return merged;
    });
  }, []);

  // Initial load — fires when auth settles or user changes
  useEffect(() => {
    if (authLoading) return;
    const forProvider = user?.role === 'provider';
    fetchListings(1, true, searchQuery, filters, forProvider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.role]);

  // Polling params (students only — providers use dedicated endpoint)
  const currentQueryParams: ListingQueryParams = {
    page: 1,
    limit: LISTINGS_PER_PAGE * currentPage,
    search: searchQuery || undefined,
    dietary: filters.dietary.length > 0 ? filters.dietary : undefined,
    location: filters.location || undefined,
    food_type: filters.food_type || undefined,
  };

  useListingsPolling(currentQueryParams, {
    enabled: listings.length > 0,
    pollInterval: 30000,
    onListingsUpdate: handleListingsUpdate,
    onError: (error) => console.error('Polling error:', error),
  });

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchListings(currentPage + 1, false, searchQuery, filters, false);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchListings, searchQuery, filters, user]);

  // If viewing a specific listing, show detail view
  if (listingId) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/listings')} data-testid="back-to-listings-button">
          ← Back to Listings
        </Button>
        <ListingDetail listingId={listingId} />
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setListings([]);
    fetchListings(1, true, query, filters, false);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setListings([]);
    fetchListings(1, true, searchQuery, newFilters, false);
  };

  const handleReserve = (id: string) => navigate(`/listings/${id}`);

  const handleFilterByDietary = (dietary: string) => {
    const newFilters = {
      ...filters,
      dietary: filters.dietary.includes(dietary)
        ? filters.dietary.filter((d) => d !== dietary)
        : [...filters.dietary, dietary],
    };
    handleFilterChange(newFilters);
  };

  const handleEdit = (id: string) => {
    const listing = listingsMapRef.current.get(id);
    if (listing) { setEditingListing(listing); setShowEditModal(true); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsService.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.listing_id !== id));
      listingsMapRef.current.delete(id);
      showToast('Listing deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete listing', 'error');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showToast('Listing created successfully', 'success');
    setCurrentPage(1);
    setListings([]);
    fetchListings(1, true, searchQuery, filters, isProvider);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingListing(null);
    showToast('Listing updated successfully', 'success');
    setCurrentPage(1);
    setListings([]);
    fetchListings(1, true, searchQuery, filters, isProvider);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Listings</h1>
          <p className="mt-2 text-gray-600">
            {showProviderListings
              ? 'Manage your food listings — edit, delete, or create new ones.'
              : 'Browse and reserve available food listings.'}
          </p>
        </div>
        {isProvider && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#ff6b35' }}
            data-testid="create-listing-button"
          >
            + Create Listing
          </button>
        )}
      </div>

      {/* Search Bar — students only */}
      {!showProviderListings && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <ListingSearchBar onSearch={handleSearch} value={searchQuery} />
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Filters Sidebar — students only */}
        {!showProviderListings && (
          <div className="hidden lg:block w-56 flex-shrink-0">
            <ListingFilters filters={filters} onChange={handleFilterChange} />
          </div>
        )}

        {/* Listings Grid */}
        <div className="flex-1 min-w-0">
          {listings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-lg font-medium text-gray-900">
                {showProviderListings ? 'No listings yet' : 'No listings found'}
              </p>
              <p className="text-gray-600 mt-1">
                {showProviderListings
                  ? 'Create your first food listing to get started.'
                  : searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'No listings available at the moment.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {listings.length} of {totalCount} listings
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.listing_id}
                    listing={listing}
                    currentUser={user}
                    isProviderOwned={showProviderListings}
                    onReserve={handleReserve}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onFilterByDietary={handleFilterByDietary}
                  />
                ))}
              </div>
              {hasMore && (
                <div ref={observerTarget} className="mt-8 flex justify-center" data-testid="infinite-scroll-trigger">
                  {isLoadingMore && <LoadingSpinner size="md" />}
                </div>
              )}
              {!hasMore && listings.length > 0 && (
                <div className="mt-8 text-center text-gray-600">
                  <p>You've reached the end of the listings.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Food Listing" className="max-w-2xl" data-testid="create-listing-modal">
        <CreateListingForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Listing Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Food Listing" data-testid="edit-listing-modal">
        {editingListing && (
          <EditListingForm listingId={editingListing.listing_id} onSuccess={handleEditSuccess} onCancel={() => setShowEditModal(false)} />
        )}
      </Modal>
    </div>
  );
};

export default ListingsPage;
