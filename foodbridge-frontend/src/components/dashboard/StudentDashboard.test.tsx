import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StudentDashboard from './StudentDashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import * as listingsService from '../../services/listingsService';
import * as reservationsService from '../../services/reservationsService';
import * as pantryService from '../../services/pantryService';
import * as notificationsService from '../../services/notificationsService';
import type { Listing } from '../../types/listings';
import type { Reservation } from '../../types/reservations';
import type { Appointment } from '../../types/pantry';
import type { Notification } from '../../types/notifications';

// Mock the services
vi.mock('../../services/listingsService');
vi.mock('../../services/reservationsService');
vi.mock('../../services/pantryService');
vi.mock('../../services/notificationsService');

// Mock useAuth hook
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        user_id: 'student-123',
        email: 'student@example.com',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

const mockListing: Listing = {
  listing_id: 'listing-1',
  provider_id: 'provider-1',
  food_name: 'Pizza',
  description: 'Delicious pizza',
  quantity: 10,
  available_quantity: 5,
  location: 'Campus Center',
  pickup_window_start: '2024-12-20T12:00:00Z',
  pickup_window_end: '2024-12-20T13:00:00Z',
  food_type: 'Italian',
  dietary_tags: ['vegetarian'],
  listing_type: 'donation',
  status: 'active',
  created_at: '2024-12-19T00:00:00Z',
  updated_at: '2024-12-19T00:00:00Z',
};

const mockReservation: Reservation = {
  reservation_id: 'res-1',
  listing_id: 'listing-1',
  student_id: 'student-123',
  quantity: 2,
  status: 'active',
  created_at: '2024-12-19T00:00:00Z',
  listing: mockListing,
};

const mockAppointment: Appointment = {
  appointment_id: 'apt-1',
  student_id: 'student-123',
  slot_id: 'slot-1',
  status: 'scheduled',
  created_at: '2024-12-19T00:00:00Z',
  appointment_time: '2024-12-20T14:00:00Z',
  slot: {
    slot_id: 'slot-1',
    slot_time: '2024-12-20T14:00:00Z',
    is_booked: true,
  },
};

const mockNotification: Notification = {
  notification_id: 'notif-1',
  user_id: 'student-123',
  type: 'reservation',
  message: 'Your reservation was confirmed',
  is_read: false,
  created_at: '2024-12-19T10:00:00Z',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message with user email', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, student@example.com!/)).toBeInTheDocument();
    });
  });

  it('displays quick action buttons', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('displays recent listings section', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [mockListing],
      pagination: { total_count: 1, page: 1, limit: 20, total_pages: 1 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Food Listings')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  it('displays empty state for listings when none available', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No food listings available right now')).toBeInTheDocument();
    });
  });

  it('displays upcoming reservations', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([
      mockReservation,
    ]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Reservations')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    });
  });

  it('displays empty state for reservations when none exist', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No active reservations')).toBeInTheDocument();
    });
  });

  it('displays pantry appointments', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([
      mockAppointment,
    ]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pantry Appointments')).toBeInTheDocument();
      expect(screen.getByText('Pantry Appointment')).toBeInTheDocument();
    });
  });

  it('displays empty state for appointments when none exist', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming appointments')).toBeInTheDocument();
    });
  });

  it('displays recent notifications', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([
      mockNotification,
    ]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
      expect(screen.getByText('Your reservation was confirmed')).toBeInTheDocument();
    });
  });

  it('displays empty state for notifications when none exist', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  it('filters out inactive reservations', async () => {
    const inactiveReservation: Reservation = {
      ...mockReservation,
      status: 'cancelled',
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([
      inactiveReservation,
    ]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No active reservations')).toBeInTheDocument();
    });
  });

  it('filters out non-scheduled appointments', async () => {
    const completedAppointment: Appointment = {
      ...mockAppointment,
      status: 'completed',
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([
      completedAppointment,
    ]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming appointments')).toBeInTheDocument();
    });
  });

  it('limits displayed items to 3 per section', async () => {
    const listings = Array.from({ length: 5 }, (_, i) => ({
      ...mockListing,
      listing_id: `listing-${i}`,
      food_name: `Food ${i}`,
    }));

    (listingsService.default.getListings as any).mockResolvedValue({
      data: listings,
      pagination: { total_count: 5, page: 1, limit: 20, total_pages: 1 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      // Should display first 3 listings
      expect(screen.getByText('Food 0')).toBeInTheDocument();
      expect(screen.getByText('Food 1')).toBeInTheDocument();
      expect(screen.getByText('Food 2')).toBeInTheDocument();
    });
  });

  it('fetches data on component mount', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(listingsService.default.getListings).toHaveBeenCalled();
      expect(reservationsService.default.getStudentReservations).toHaveBeenCalledWith(
        'student-123'
      );
      expect(pantryService.default.getStudentAppointments).toHaveBeenCalledWith('student-123');
      expect(notificationsService.default.getNotifications).toHaveBeenCalledWith('student-123');
    });
  });
});


/**
 * Property 11: Dashboard displays user's reservations and appointments
 * 
 * For any student with active reservations or pantry appointments, accessing the dashboard 
 * should display those reservations and appointments.
 * 
 * Validates: Requirements 3.2
 */
describe('StudentDashboard - Property 11: Reservations and Appointments Display', () => {
  it('should display active reservations when student has them', async () => {
    const mockReservation: Reservation = {
      reservation_id: 'res-1',
      listing_id: 'listing-1',
      student_id: 'student-123',
      quantity: 2,
      status: 'active',
      created_at: '2024-12-19T00:00:00Z',
      listing: mockListing,
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([
      mockReservation,
    ]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(reservationsService.default.getStudentReservations).toHaveBeenCalledWith(
        'student-123'
      );
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  it('should display scheduled appointments when student has them', async () => {
    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([
      mockAppointment,
    ]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(pantryService.default.getStudentAppointments).toHaveBeenCalledWith(
        'student-123'
      );
      expect(screen.getByText('Pantry Appointments')).toBeInTheDocument();
    });
  });

  it('should display both reservations and appointments together', async () => {
    const mockReservation: Reservation = {
      reservation_id: 'res-1',
      listing_id: 'listing-1',
      student_id: 'student-123',
      quantity: 2,
      status: 'active',
      created_at: '2024-12-19T00:00:00Z',
      listing: mockListing,
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([
      mockReservation,
    ]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([
      mockAppointment,
    ]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Reservations')).toBeInTheDocument();
      expect(screen.getByText('Pantry Appointments')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  it('should only display active reservations, not cancelled ones', async () => {
    const activeReservation: Reservation = {
      reservation_id: 'res-1',
      listing_id: 'listing-1',
      student_id: 'student-123',
      quantity: 2,
      status: 'active',
      created_at: '2024-12-19T00:00:00Z',
      listing: { ...mockListing, food_name: 'Active Pizza' },
    };

    const cancelledReservation: Reservation = {
      reservation_id: 'res-2',
      listing_id: 'listing-2',
      student_id: 'student-123',
      quantity: 1,
      status: 'cancelled',
      created_at: '2024-12-19T00:00:00Z',
      listing: { ...mockListing, listing_id: 'listing-2', food_name: 'Cancelled Burger' },
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([
      activeReservation,
      cancelledReservation,
    ]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Cancelled Burger')).not.toBeInTheDocument();
    });
  });

  it('should only display scheduled appointments, not completed ones', async () => {
    const scheduledAppointment: Appointment = {
      appointment_id: 'apt-1',
      student_id: 'student-123',
      slot_id: 'slot-1',
      status: 'scheduled',
      created_at: '2024-12-19T00:00:00Z',
      appointment_time: '2024-12-20T14:00:00Z',
      slot: {
        slot_id: 'slot-1',
        slot_time: '2024-12-20T14:00:00Z',
        is_booked: true,
      },
    };

    const completedAppointment: Appointment = {
      appointment_id: 'apt-2',
      student_id: 'student-123',
      slot_id: 'slot-2',
      status: 'completed',
      created_at: '2024-12-18T00:00:00Z',
      appointment_time: '2024-12-19T14:00:00Z',
      slot: {
        slot_id: 'slot-2',
        slot_time: '2024-12-19T14:00:00Z',
        is_booked: true,
      },
    };

    (listingsService.default.getListings as any).mockResolvedValue({
      data: [],
      pagination: { total_count: 0, page: 1, limit: 20, total_pages: 0 },
    });
    (reservationsService.default.getStudentReservations as any).mockResolvedValue([]);
    (pantryService.default.getStudentAppointments as any).mockResolvedValue([
      scheduledAppointment,
      completedAppointment,
    ]);
    (notificationsService.default.getNotifications as any).mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pantry Appointments')).toBeInTheDocument();
      expect(pantryService.default.getStudentAppointments).toHaveBeenCalledWith(
        'student-123'
      );
    });
  });
});
