import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import VolunteerOpportunities from './VolunteerOpportunities';
import type { VolunteerOpportunity } from '../../types/events';
import * as ToastHook from '../../hooks/useToast';

// Mock the useToast hook
vi.mock('../../hooks/useToast');

const mockShowToast = vi.fn();

/**
 * Property-Based Tests for VolunteerOpportunities Component
 * **Validates: Requirements 7.5**
 *
 * These tests verify that volunteer signup displays confirmation
 * by testing the signup flow and confirmation message display.
 */
describe('VolunteerOpportunities Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ToastHook.default as any).mockReturnValue({
      showToast: mockShowToast,
    });
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 34: Volunteer signup displays confirmation
   *
   * For any volunteer opportunity signup, the application should send the
   * signup to the backend API and display a confirmation message.
   *
   * Validates: Requirements 7.5
   */
  it('Property 34: Volunteer signup displays confirmation', async () => {
    // Generate arbitrary volunteer opportunities
    const opportunityArbitrary = fc.record({
      opportunity_id: fc.uuid(),
      title: fc.stringMatching(/^[A-Za-z\s]{5,30}$/),
      description: fc.stringMatching(/^[A-Za-z\s]{10,50}$/),
      max_volunteers: fc.integer({ min: 5, max: 50 }),
      current_volunteers: fc.integer({ min: 0, max: 4 }),
      event_date: fc.constant('2024-03-20T10:00:00Z'),
      status: fc.constant('open'),
      created_at: fc.constant('2024-03-01T00:00:00Z'),
    });

    await fc.assert(
      fc.asyncProperty(opportunityArbitrary, async (opportunity) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        // Ensure current_volunteers < max_volunteers for valid signup
        const validOpportunity: VolunteerOpportunity = {
          ...opportunity,
          current_volunteers: Math.min(opportunity.current_volunteers, opportunity.max_volunteers - 1),
        };

        // Mock the onSignup callback
        const mockOnSignup = vi.fn().mockResolvedValue(undefined);
        const mockOnSignupSuccess = vi.fn();

        render(
          <VolunteerOpportunities
            opportunities={[validOpportunity]}
            onSignup={mockOnSignup}
            onSignupSuccess={mockOnSignupSuccess}
          />
        );

        // Find and click the signup button
        const signupButton = screen.getByTestId(
          `signup-button-${validOpportunity.opportunity_id}`
        );

        // Verify button is enabled (opportunity is open and not full)
        expect(signupButton).not.toBeDisabled();
        expect(signupButton).toHaveTextContent('Sign Up');

        // Click the signup button
        fireEvent.click(signupButton);

        // Verify the onSignup callback was called with the correct opportunity ID
        await waitFor(() => {
          expect(mockOnSignup).toHaveBeenCalledWith(validOpportunity.opportunity_id);
        }, { timeout: 3000 });

        // Verify the success toast was shown with confirmation message
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Successfully signed up for volunteer opportunity',
            'success'
          );
        }, { timeout: 3000 });

        // Verify the onSignupSuccess callback was called
        await waitFor(() => {
          expect(mockOnSignupSuccess).toHaveBeenCalled();
        }, { timeout: 3000 });

        // Verify that the signup button is no longer in loading state
        await waitFor(() => {
          expect(signupButton).not.toBeDisabled();
        }, { timeout: 3000 });
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 34 Extended: Volunteer signup confirmation with various opportunity states
   *
   * For any volunteer opportunity with different volunteer counts and capacities,
   * signing up should display a confirmation message when the opportunity is open
   * and not full.
   *
   * Validates: Requirements 7.5
   */
  it('Property 34 Extended: Volunteer signup confirmation with various opportunity states', async () => {
    // Generate opportunities with varying volunteer counts
    const opportunityArbitrary = fc.tuple(
      fc.integer({ min: 5, max: 50 }),
      fc.integer({ min: 0, max: 4 })
    ).map(([maxVolunteers, currentVolunteers]) => ({
      opportunity_id: fc.sample(fc.uuid(), 1)[0],
      title: 'Volunteer Opportunity',
      description: 'Help with campus food drive',
      max_volunteers: maxVolunteers,
      current_volunteers: currentVolunteers,
      event_date: '2024-03-20T10:00:00Z',
      status: 'open' as const,
      created_at: '2024-03-01T00:00:00Z',
    }));

    await fc.assert(
      fc.asyncProperty(opportunityArbitrary, async (opportunity) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        // Ensure the opportunity is not full
        const validOpportunity: VolunteerOpportunity = {
          ...opportunity,
          current_volunteers: Math.min(opportunity.current_volunteers, opportunity.max_volunteers - 1),
        };

        // Verify the opportunity is open and not full
        expect(validOpportunity.status).toBe('open');
        expect(validOpportunity.current_volunteers).toBeLessThan(validOpportunity.max_volunteers);

        const mockOnSignup = vi.fn().mockResolvedValue(undefined);
        const mockOnSignupSuccess = vi.fn();

        render(
          <VolunteerOpportunities
            opportunities={[validOpportunity]}
            onSignup={mockOnSignup}
            onSignupSuccess={mockOnSignupSuccess}
          />
        );

        // Find and click the signup button
        const signupButton = screen.getByTestId(
          `signup-button-${validOpportunity.opportunity_id}`
        );

        // Verify button is enabled
        expect(signupButton).not.toBeDisabled();

        // Click the signup button
        fireEvent.click(signupButton);

        // Verify the API was called
        await waitFor(() => {
          expect(mockOnSignup).toHaveBeenCalledWith(validOpportunity.opportunity_id);
        }, { timeout: 3000 });

        // Verify the success confirmation message was displayed
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Successfully signed up for volunteer opportunity',
            'success'
          );
        }, { timeout: 3000 });

        // Verify the success callback was called
        await waitFor(() => {
          expect(mockOnSignupSuccess).toHaveBeenCalled();
        }, { timeout: 3000 });
      }),
      { numRuns: 40 }
    );
  });

  /**
   * Property 34 Extended: Multiple volunteer signups display individual confirmations
   *
   * For any set of volunteer opportunities, signing up for each one should
   * display a confirmation message for each signup.
   *
   * Validates: Requirements 7.5
   */
  it('Property 34 Extended: Multiple volunteer signups display individual confirmations', async () => {
    // Generate multiple opportunities
    const opportunitiesArbitrary = fc.array(
      fc.record({
        opportunity_id: fc.uuid(),
        title: fc.stringMatching(/^[A-Za-z\s]{5,20}$/),
        description: fc.stringMatching(/^[A-Za-z\s]{10,40}$/),
        max_volunteers: fc.integer({ min: 5, max: 30 }),
        current_volunteers: fc.integer({ min: 0, max: 2 }),
        event_date: fc.constant('2024-03-20T10:00:00Z'),
        status: fc.constant('open'),
        created_at: fc.constant('2024-03-01T00:00:00Z'),
      }),
      { minLength: 2, maxLength: 5 }
    );

    await fc.assert(
      fc.asyncProperty(opportunitiesArbitrary, async (opportunities) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        // Ensure all opportunities are valid (not full)
        const validOpportunities: VolunteerOpportunity[] = opportunities.map((opp) => ({
          ...opp,
          current_volunteers: Math.min(opp.current_volunteers, opp.max_volunteers - 1),
        }));

        const mockOnSignup = vi.fn().mockResolvedValue(undefined);
        const mockOnSignupSuccess = vi.fn();

        render(
          <VolunteerOpportunities
            opportunities={validOpportunities}
            onSignup={mockOnSignup}
            onSignupSuccess={mockOnSignupSuccess}
          />
        );

        // Sign up for each opportunity
        for (const opportunity of validOpportunities) {
          // Clear mocks before each signup
          mockOnSignup.mockClear();
          mockShowToast.mockClear();
          mockOnSignupSuccess.mockClear();

          const signupButton = screen.getByTestId(
            `signup-button-${opportunity.opportunity_id}`
          );

          // Verify button is enabled
          expect(signupButton).not.toBeDisabled();

          // Click the signup button
          fireEvent.click(signupButton);

          // Verify the API was called for this opportunity
          await waitFor(() => {
            expect(mockOnSignup).toHaveBeenCalledWith(opportunity.opportunity_id);
          }, { timeout: 3000 });

          // Verify the success confirmation message was displayed
          await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
              'Successfully signed up for volunteer opportunity',
              'success'
            );
          }, { timeout: 3000 });

          // Verify the success callback was called
          await waitFor(() => {
            expect(mockOnSignupSuccess).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 35: Full volunteer opportunities disable sign-up button
   *
   * For any volunteer opportunity where current_volunteers >= max_volunteers,
   * the sign-up button should be disabled and display "Full" text.
   *
   * Validates: Requirements 7.6
   */
  it('Property 35: Full volunteer opportunities disable sign-up button', async () => {
    // Generate opportunities where current_volunteers >= max_volunteers
    const opportunityArbitrary = fc.record({
      opportunity_id: fc.uuid(),
      title: fc.stringMatching(/^[A-Za-z\s]{5,30}$/),
      description: fc.stringMatching(/^[A-Za-z\s]{10,50}$/),
      max_volunteers: fc.integer({ min: 5, max: 50 }),
      current_volunteers: fc.integer({ min: 0, max: 50 }),
      event_date: fc.constant('2024-03-20T10:00:00Z'),
      status: fc.constant('open'),
      created_at: fc.constant('2024-03-01T00:00:00Z'),
    });

    await fc.assert(
      fc.asyncProperty(opportunityArbitrary, async (opportunity) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        // Ensure the opportunity is full (current_volunteers >= max_volunteers)
        const fullOpportunity: VolunteerOpportunity = {
          ...opportunity,
          current_volunteers: opportunity.max_volunteers,
        };

        // Verify the opportunity is full
        expect(fullOpportunity.current_volunteers).toBeGreaterThanOrEqual(
          fullOpportunity.max_volunteers
        );

        render(
          <VolunteerOpportunities opportunities={[fullOpportunity]} />
        );

        // Find the signup button
        const signupButton = screen.getByTestId(
          `signup-button-${fullOpportunity.opportunity_id}`
        );

        // Verify the button is disabled
        expect(signupButton).toBeDisabled();

        // Verify the button displays "Full" text
        expect(signupButton).toHaveTextContent('Full');

        // Verify the button cannot be clicked
        fireEvent.click(signupButton);

        // The onSignup callback should not be called since the button is disabled
        // (This is implicitly verified by the button being disabled)
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 35 Extended: Full opportunities with various volunteer counts
   *
   * For any volunteer opportunity with current_volunteers >= max_volunteers,
   * regardless of the specific numbers, the sign-up button should be disabled
   * and display "Full" text.
   *
   * Validates: Requirements 7.6
   */
  it('Property 35 Extended: Full opportunities with various volunteer counts', async () => {
    // Generate opportunities with varying volunteer counts where full condition is met
    const opportunityArbitrary = fc.tuple(
      fc.integer({ min: 5, max: 50 }),
      fc.integer({ min: 0, max: 20 })
    ).map(([maxVolunteers, extraVolunteers]) => ({
      opportunity_id: fc.sample(fc.uuid(), 1)[0],
      title: 'Full Volunteer Opportunity',
      description: 'This opportunity is at capacity',
      max_volunteers: maxVolunteers,
      current_volunteers: maxVolunteers + extraVolunteers,
      event_date: '2024-03-20T10:00:00Z',
      status: 'open' as const,
      created_at: '2024-03-01T00:00:00Z',
    }));

    await fc.assert(
      fc.asyncProperty(opportunityArbitrary, async (opportunity) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        // Verify the opportunity is full
        expect(opportunity.current_volunteers).toBeGreaterThanOrEqual(
          opportunity.max_volunteers
        );

        render(
          <VolunteerOpportunities opportunities={[opportunity]} />
        );

        // Find the signup button
        const signupButton = screen.getByTestId(
          `signup-button-${opportunity.opportunity_id}`
        );

        // Verify the button is disabled
        expect(signupButton).toBeDisabled();

        // Verify the button displays "Full" text
        expect(signupButton).toHaveTextContent('Full');

        // Verify the volunteer count display shows the full status
        const volunteerCountText = screen.getByText(
          new RegExp(`${opportunity.current_volunteers} \\/ ${opportunity.max_volunteers}`)
        );
        expect(volunteerCountText).toBeInTheDocument();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 35 Extended: Mixed opportunities with some full and some available
   *
   * For any set of volunteer opportunities where some are full and some are available,
   * only the full opportunities should have disabled sign-up buttons displaying "Full".
   *
   * Validates: Requirements 7.6
   */
  it('Property 35 Extended: Mixed opportunities with some full and some available', async () => {
    // Generate a mix of full and available opportunities
    const opportunitiesArbitrary = fc.tuple(
      fc.array(
        fc.record({
          opportunity_id: fc.uuid(),
          title: fc.stringMatching(/^[A-Za-z\s]{5,20}$/),
          description: fc.stringMatching(/^[A-Za-z\s]{10,40}$/),
          max_volunteers: fc.integer({ min: 5, max: 30 }),
          current_volunteers: fc.integer({ min: 0, max: 2 }),
          event_date: fc.constant('2024-03-20T10:00:00Z'),
          status: fc.constant('open'),
          created_at: fc.constant('2024-03-01T00:00:00Z'),
        }),
        { minLength: 1, maxLength: 3 }
      ),
      fc.array(
        fc.record({
          opportunity_id: fc.uuid(),
          title: fc.stringMatching(/^[A-Za-z\s]{5,20}$/),
          description: fc.stringMatching(/^[A-Za-z\s]{10,40}$/),
          max_volunteers: fc.integer({ min: 5, max: 30 }),
          current_volunteers: fc.integer({ min: 0, max: 30 }),
          event_date: fc.constant('2024-03-20T10:00:00Z'),
          status: fc.constant('open'),
          created_at: fc.constant('2024-03-01T00:00:00Z'),
        }),
        { minLength: 1, maxLength: 3 }
      )
    ).map(([available, full]) => {
      // Ensure available opportunities are not full
      const validAvailable = available.map((opp) => ({
        ...opp,
        current_volunteers: Math.min(opp.current_volunteers, opp.max_volunteers - 1),
      }));

      // Ensure full opportunities are full
      const validFull = full.map((opp) => ({
        ...opp,
        current_volunteers: opp.max_volunteers,
      }));

      return [...validAvailable, ...validFull];
    });

    await fc.assert(
      fc.asyncProperty(opportunitiesArbitrary, async (opportunities) => {
        cleanup();
        vi.clearAllMocks();
        (ToastHook.default as any).mockReturnValue({
          showToast: mockShowToast,
        });

        render(
          <VolunteerOpportunities opportunities={opportunities} />
        );

        // Check each opportunity
        for (const opportunity of opportunities) {
          const signupButton = screen.getByTestId(
            `signup-button-${opportunity.opportunity_id}`
          );

          const isFull = opportunity.current_volunteers >= opportunity.max_volunteers;

          if (isFull) {
            // Full opportunities should have disabled buttons with "Full" text
            expect(signupButton).toBeDisabled();
            expect(signupButton).toHaveTextContent('Full');
          } else {
            // Available opportunities should have enabled buttons with "Sign Up" text
            expect(signupButton).not.toBeDisabled();
            expect(signupButton).toHaveTextContent('Sign Up');
          }
        }
      }),
      { numRuns: 50 }
    );
  });
});
