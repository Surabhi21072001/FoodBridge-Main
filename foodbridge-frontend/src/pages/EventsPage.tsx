import React, { useEffect, useState, useRef } from 'react';
import useToast from '../hooks/useToast';
import eventsService from '../services/eventsService';
import type { Listing } from '../types/listings';
import type { VolunteerOpportunity } from '../types/events';
import type { User } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EventFoodList from '../components/events/EventFoodList';
import VolunteerOpportunities from '../components/events/VolunteerOpportunities';
import { useAuth } from '../contexts/AuthContext';

const EventsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [eventFood, setEventFood] = useState<Listing[]>([]);
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple API calls on component mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchEventsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch volunteer opportunities
        try {
          const opportunitiesData = await eventsService.getVolunteerOpportunities();
          setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);
        } catch (error) {
          console.error('Error fetching volunteer opportunities:', error);
          showToast('Failed to load volunteer opportunities', 'error');
          setOpportunities([]);
        }
        
        // Fetch event food
        try {
          const foodData = await eventsService.getEventFood({ available_now: true, page: 1, limit: 20 });
          setEventFood(Array.isArray(foodData) ? foodData : []);
        } catch (error) {
          console.error('Error fetching event food:', error);
          showToast('Failed to load event food', 'error');
          setEventFood([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsData();
  }, [showToast]);

  const handleVolunteerSignup = async (opportunityId: string) => {
    try {
      await eventsService.signUpForVolunteer(opportunityId);
      showToast('Successfully signed up for volunteer opportunity', 'success');
      // Refresh opportunities after successful signup
      const updatedOpportunities = await eventsService.getVolunteerOpportunities();
      setOpportunities(Array.isArray(updatedOpportunities) ? updatedOpportunities : []);
    } catch (error) {
      console.error('Error signing up for volunteer:', error);
      showToast('Failed to sign up for volunteer opportunity', 'error');
    }
  };

  const handleReservationSuccess = async () => {
    // Refresh event food after successful reservation
    try {
      const foodData = await eventsService.getEventFood({ available_now: true, page: 1, limit: 20 });
      setEventFood(Array.isArray(foodData) ? foodData : []);
    } catch (error) {
      console.error('Error refreshing event food:', error);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-600">View event food and volunteer opportunities.</p>
      </div>

      {/* Event Food Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Food</h2>
        <EventFoodList
          listings={eventFood}
          currentUser={user as User | null}
          isLoading={isLoading}
          onReservationSuccess={handleReservationSuccess}
        />
      </div>

      {/* Volunteer Opportunities Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Opportunities</h2>
        <VolunteerOpportunities
          opportunities={opportunities}
          isLoading={isLoading}
          onSignup={handleVolunteerSignup}
          onSignupSuccess={() => {
            // Refresh opportunities after successful signup
            eventsService.getVolunteerOpportunities().then((data) => {
              setOpportunities(Array.isArray(data) ? data : []);
            });
          }}
        />
      </div>
    </div>
  );
};

export default EventsPage;
