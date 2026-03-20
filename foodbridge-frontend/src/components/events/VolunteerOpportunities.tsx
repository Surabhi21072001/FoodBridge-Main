import React, { useState } from 'react';
import type { VolunteerOpportunity } from '../../types/events';
import Button from '../shared/Button';
import useToast from '../../hooks/useToast';

export interface VolunteerOpportunitiesProps {
  opportunities: VolunteerOpportunity[];
  isLoading?: boolean;
  onSignupSuccess?: () => void;
  onSignup?: (opportunityId: string) => Promise<void>;
}

const VolunteerOpportunities: React.FC<VolunteerOpportunitiesProps> = ({
  opportunities,
  isLoading = false,
  onSignupSuccess,
  onSignup,
}) => {
  const { showToast } = useToast();
  const [signingUpId, setSigningUpId] = useState<string | null>(null);

  const handleSignup = async (opportunityId: string) => {
    try {
      setSigningUpId(opportunityId);
      if (onSignup) {
        await onSignup(opportunityId);
      }
      showToast('Successfully signed up for volunteer opportunity', 'success');
      onSignupSuccess?.();
    } catch (error) {
      showToast('Failed to sign up for volunteer opportunity', 'error');
      console.error('Error signing up:', error);
    } finally {
      setSigningUpId(null);
    }
  };

  const isFull = (opportunity: VolunteerOpportunity): boolean => {
    return opportunity.current_volunteers >= opportunity.max_volunteers;
  };

  const isSignupDisabled = (opportunity: VolunteerOpportunity): boolean => {
    return opportunity.status !== 'open' || isFull(opportunity);
  };

  const getButtonLabel = (opportunity: VolunteerOpportunity): string => {
    if (opportunity.status !== 'open') {
      return 'Closed';
    }
    if (isFull(opportunity)) {
      return 'Full';
    }
    return 'Sign Up';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4 h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-600">No volunteer opportunities available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {opportunities.map((opportunity) => (
        <div
          key={opportunity.opportunity_id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          data-testid={`volunteer-card-${opportunity.opportunity_id}`}
        >
          <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{opportunity.description}</p>
          
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Volunteers:</span> {opportunity.current_volunteers} /{' '}
              {opportunity.max_volunteers}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Event Date:</span>{' '}
              {new Date(opportunity.event_date).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  opportunity.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : opportunity.status === 'closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {opportunity.status}
              </span>
            </p>
          </div>

          <Button
            onClick={() => handleSignup(opportunity.opportunity_id)}
            disabled={isSignupDisabled(opportunity)}
            isLoading={signingUpId === opportunity.opportunity_id}
            className="mt-4 w-full"
            data-testid={`signup-button-${opportunity.opportunity_id}`}
          >
            {getButtonLabel(opportunity)}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default VolunteerOpportunities;
