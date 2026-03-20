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
import type { Reservation } from '../../types/reservations';
import type { Appointment } from '../../types/pantry';

vi.mock('../../services/listingsService');
vi.mock('../../services/reservationsService');
vi.mock('../../services/pantryService');
vi.mock('../../services/notificationsService');

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

describe('StudentDashboard - Property 11: Reservations and Appointments Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display active reservations when student has them', async () => {
    const mockReservation: Reservation = {
      id: 'res-1',
      listing_id: 'listing-1',
      user_id: 'student-123',
      quantity: 2,
      status: 'confirmed',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
      listing: {
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
      },
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
    const mockAppointment: Appointment = {
      id: 'apt-1',
      user_id: 'student-123',
      appointment_time: '2024-12-20T14:00:00Z',
      duration_minutes: 30,
      status: 'scheduled',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
    };

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
      id: 'res-1',
      listing_id: 'listing-1',
      user_id: 'student-123',
      quantity: 2,
      status: 'confirmed',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
      listing: {
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
      },
    };

    const mockAppointment: Appointment = {
      id: 'apt-1',
      user_id: 'student-123',
      appointment_time: '2024-12-20T14:00:00Z',
      duration_minutes: 30,
      status: 'scheduled',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
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
      id: 'res-1',
      listing_id: 'listing-1',
      user_id: 'student-123',
      quantity: 2,
      status: 'confirmed',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
      listing: {
        listing_id: 'listing-1',
        provider_id: 'provider-1',
        food_name: 'Active Pizza',
        description: 'Delicious pizza',
        quantity: 10,
        available_quantity: 5,
        location: 'Campus Center',
        pickup_window_start: '2024-12-20T12:00:00Z',
        pickup_window_end: '2024-12-20T13:00:00Z',
        food_type: 'Italian',
        dietary_tags: [],
        listing_type: 'donation',
        status: 'active',
        created_at: '2024-12-19T00:00:00Z',
        updated_at: '2024-12-19T00:00:00Z',
      },
    };

    const cancelledReservation: Reservation = {
      id: 'res-2',
      listing_id: 'listing-2',
      user_id: 'student-123',
      quantity: 1,
      status: 'cancelled',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
      listing: {
        listing_id: 'listing-2',
        provider_id: 'provider-2',
        food_name: 'Cancelled Burger',
        description: 'Burger',
        quantity: 5,
        available_quantity: 2,
        location: 'Food Court',
        pickup_window_start: '2024-12-20T14:00:00Z',
        pickup_window_end: '2024-12-20T15:00:00Z',
        food_type: 'American',
        dietary_tags: [],
        listing_type: 'donation',
        status: 'active',
        created_at: '2024-12-19T00:00:00Z',
        updated_at: '2024-12-19T00:00:00Z',
      },
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
      id: 'apt-1',
      user_id: 'student-123',
      appointment_time: '2024-12-20T14:00:00Z',
      duration_minutes: 30,
      status: 'scheduled',
      created_at: '2024-12-19T00:00:00Z',
      updated_at: '2024-12-19T00:00:00Z',
    };

    const completedAppointment: Appointment = {
      id: 'apt-2',
      user_id: 'student-123',
      appointment_time: '2024-12-19T14:00:00Z',
      duration_minutes: 30,
      status: 'completed',
      created_at: '2024-12-18T00:00:00Z',
      updated_at: '2024-12-18T00:00:00Z',
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
