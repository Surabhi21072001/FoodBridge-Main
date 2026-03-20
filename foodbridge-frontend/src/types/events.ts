/**
 * Events and Volunteer Types
 */

export interface VolunteerOpportunity {
  opportunity_id: string;
  title: string;
  description: string;
  max_volunteers: number;
  current_volunteers: number;
  event_date: string;
  status: 'open' | 'closed' | 'completed';
  created_at: string;
}

export interface VolunteerParticipation {
  participation_id: string;
  opportunity_id: string;
  student_id: string;
  status: 'signed_up' | 'completed' | 'cancelled';
  created_at: string;
  opportunity?: VolunteerOpportunity; // Populated in some responses
}
