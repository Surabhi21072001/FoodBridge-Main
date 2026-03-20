import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VolunteerOpportunities from './VolunteerOpportunities';
import type { VolunteerOpportunity } from '../../types/events';

// Mock the useToast hook
vi.mock('../../hooks/useToast', () => {
  return {
    default: function useToast() {
      return {
        showToast: vi.fn(),
      };
    },
  };
});

describe('VolunteerOpportunities', () => {
  const mockOpportunities: VolunteerOpportunity[] = [
    {
      opportunity_id: '1',
      title: 'Food Drive Setup',
      description: 'Help set up for the campus food drive',
      max_volunteers: 10,
      current_volunteers: 5,
      event_date: '2024-03-20T10:00:00Z',
      status: 'open',
      created_at: '2024-03-01T00:00:00Z',
    },
    {
      opportunity_id: '2',
      title: 'Meal Prep Assistant',
      description: 'Assist with meal preparation',
      max_volunteers: 5,
      current_volunteers: 5,
      event_date: '2024-03-21T14:00:00Z',
      status: 'open',
      created_at: '2024-03-01T00:00:00Z',
    },
    {
      opportunity_id: '3',
      title: 'Closed Event',
      description: 'This event is closed',
      max_volunteers: 10,
      current_volunteers: 3,
      event_date: '2024-03-22T10:00:00Z',
      status: 'closed',
      created_at: '2024-03-01T00:00:00Z',
    },
  ];

  it('renders volunteer opportunities', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    expect(screen.getByText('Food Drive Setup')).toBeInTheDocument();
    expect(screen.getByText('Meal Prep Assistant')).toBeInTheDocument();
    expect(screen.getByText('Closed Event')).toBeInTheDocument();
  });

  it('displays volunteer count', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    expect(screen.getByText(/5 \/ 10/)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5/)).toBeInTheDocument();
  });

  it('displays event date', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    expect(screen.getByText(/3\/20\/2024/)).toBeInTheDocument();
  });

  it('disables sign-up button when opportunity is full', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    const fullButton = screen.getByTestId('signup-button-2');
    expect(fullButton).toBeDisabled();
    expect(fullButton).toHaveTextContent('Full');
  });

  it('disables sign-up button when opportunity is closed', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    const closedButton = screen.getByTestId('signup-button-3');
    expect(closedButton).toBeDisabled();
    expect(closedButton).toHaveTextContent('Closed');
  });

  it('enables sign-up button when opportunity is open and not full', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    const openButton = screen.getByTestId('signup-button-1');
    expect(openButton).not.toBeDisabled();
    expect(openButton).toHaveTextContent('Sign Up');
  });

  it('calls onSignup when sign-up button is clicked', async () => {
    const mockOnSignup = vi.fn().mockResolvedValue(undefined);
    const mockOnSignupSuccess = vi.fn();

    render(
      <VolunteerOpportunities
        opportunities={mockOpportunities}
        onSignup={mockOnSignup}
        onSignupSuccess={mockOnSignupSuccess}
      />
    );

    const signupButton = screen.getByTestId('signup-button-1');
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalledWith('1');
      expect(mockOnSignupSuccess).toHaveBeenCalled();
    });
  });

  it('shows loading state while signing up', async () => {
    const mockOnSignup = vi.fn(
      (_id: string) => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );

    render(
      <VolunteerOpportunities
        opportunities={mockOpportunities}
        onSignup={mockOnSignup}
      />
    );

    const signupButton = screen.getByTestId('signup-button-1');
    fireEvent.click(signupButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(signupButton).toBeDisabled();
    });
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <VolunteerOpportunities opportunities={mockOpportunities} isLoading={true} />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no opportunities', () => {
    render(
      <VolunteerOpportunities opportunities={[]} />
    );

    expect(screen.getByText('No volunteer opportunities available.')).toBeInTheDocument();
  });

  it('displays correct status badge colors', () => {
    render(
      <VolunteerOpportunities opportunities={mockOpportunities} />
    );

    const openBadges = screen.getAllByText('open');
    const closedBadge = screen.getByText('closed');

    expect(openBadges[0]).toHaveClass('bg-green-100', 'text-green-800');
    expect(closedBadge).toHaveClass('bg-red-100', 'text-red-800');
  });
});
