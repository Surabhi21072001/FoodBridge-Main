import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleCalendarConnect from './GoogleCalendarConnect';
import calendarService from '../../services/calendarService';

vi.mock('../../services/calendarService', () => ({
  default: {
    getStatus: vi.fn(),
    disconnect: vi.fn(),
  },
}));

const mockCalendarService = calendarService as {
  getStatus: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe('GoogleCalendarConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Validates: Requirements 5.1
  it('renders connect button when status is disconnected', async () => {
    mockCalendarService.getStatus.mockResolvedValue({ connected: false });

    render(<GoogleCalendarConnect />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Connect Google Calendar/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/api/auth/google/calendar');
    });

    expect(screen.queryByRole('button', { name: /Disconnect/i })).not.toBeInTheDocument();
  });

  // Validates: Requirements 5.3
  it('renders disconnect button and connected indicator when status is connected', async () => {
    mockCalendarService.getStatus.mockResolvedValue({ connected: true });

    render(<GoogleCalendarConnect />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Disconnect Google Calendar/i })).toBeInTheDocument();
      expect(screen.getByText(/Google Calendar connected/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('link', { name: /Connect Google Calendar/i })).not.toBeInTheDocument();
  });

  // Validates: Requirements 5.4
  it('calls disconnect service and updates UI to disconnected state on disconnect click', async () => {
    mockCalendarService.getStatus.mockResolvedValue({ connected: true });
    mockCalendarService.disconnect.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<GoogleCalendarConnect />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Disconnect Google Calendar/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Disconnect Google Calendar/i }));

    expect(mockCalendarService.disconnect).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Connect Google Calendar/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Disconnect/i })).not.toBeInTheDocument();
  });

  it('shows loading state while fetching status', () => {
    mockCalendarService.getStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ connected: false }), 100))
    );

    render(<GoogleCalendarConnect />);

    expect(screen.getByLabelText(/Loading calendar status/i)).toBeInTheDocument();
  });
});
