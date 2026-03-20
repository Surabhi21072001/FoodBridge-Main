import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import pantryService from './pantryService';
import api from './api';
import type { Appointment } from '../types/pantry';

// Mock the API
vi.mock('./api');

describe('PantryService Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 28: Appointment booking displays confirmation', () => {
    /**
     * Validates: Requirements 6.6
     *
     * For any successful appointment booking, the application should display
     * a confirmation message and update the appointments list. This property
     * verifies that when a user books an appointment by providing a slot_id,
     * the system returns an appointment object with the correct status and
     * can be added to the appointments list.
     */

    it('should return appointment with scheduled status on successful booking (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          async (slotNum) => {
            const slot_id = `slot-${slotNum}`;
            const appointment_id = `apt-${slotNum}`;

            const mockAppointment: Appointment = {
              appointment_id,
              student_id: 'student-123',
              slot_id,
              status: 'scheduled',
              created_at: new Date().toISOString(),
              appointment_time: new Date().toISOString(),
            };

            vi.mocked(api.post).mockImplementation(async () => ({
              data: { appointment: mockAppointment },
            }));

            const result = await pantryService.bookAppointment({ slot_id });

            // Verify the appointment is returned
            expect(result).toBeDefined();
            expect(result.appointment_id).toBe(appointment_id);
            expect(result.status).toBe('scheduled');
            expect(result.slot_id).toBe(slot_id);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return appointment with correct student_id (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          async (slotNum) => {
            const slot_id = `slot-${slotNum}`;
            const appointment_id = `apt-${slotNum}`;
            const student_id = `student-${slotNum}`;

            const mockAppointment: Appointment = {
              appointment_id,
              student_id,
              slot_id,
              status: 'scheduled',
              created_at: new Date().toISOString(),
              appointment_time: new Date().toISOString(),
            };

            vi.mocked(api.post).mockImplementation(async () => ({
              data: { appointment: mockAppointment },
            }));

            const result = await pantryService.bookAppointment({ slot_id });

            // Verify student_id is preserved
            expect(result.student_id).toBe(student_id);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return appointment with valid appointment_time (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          async (slotNum) => {
            const slot_id = `slot-${slotNum}`;
            const appointment_id = `apt-${slotNum}`;
            const appointmentTime = new Date().toISOString();

            const mockAppointment: Appointment = {
              appointment_id,
              student_id: 'student-123',
              slot_id,
              status: 'scheduled',
              created_at: new Date().toISOString(),
              appointment_time: appointmentTime,
            };

            vi.mocked(api.post).mockImplementation(async () => ({
              data: { appointment: mockAppointment },
            }));

            const result = await pantryService.bookAppointment({ slot_id });

            // Verify appointment_time is a valid ISO string
            expect(result.appointment_time).toBe(appointmentTime);
            expect(() => new Date(result.appointment_time)).not.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should call API endpoint for appointment booking (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          async (slotNum) => {
            const slot_id = `slot-${slotNum}`;
            const appointment_id = `apt-${slotNum}`;

            const mockAppointment: Appointment = {
              appointment_id,
              student_id: 'student-123',
              slot_id,
              status: 'scheduled',
              created_at: new Date().toISOString(),
              appointment_time: new Date().toISOString(),
            };

            vi.mocked(api.post).mockImplementation(async () => ({
              data: { appointment: mockAppointment },
            }));

            await pantryService.bookAppointment({ slot_id });

            // Verify API was called
            expect(vi.mocked(api.post)).toHaveBeenCalled();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle multiple sequential bookings (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 5 }),
          async (slotNums) => {
            // Mock API to return a valid appointment for any call
            vi.mocked(api.post).mockImplementation(async (endpoint: string, data: any) => {
              const appointment: Appointment = {
                appointment_id: `apt-${data.slot_id}`,
                student_id: 'student-123',
                slot_id: data.slot_id,
                status: 'scheduled',
                created_at: new Date().toISOString(),
                appointment_time: new Date().toISOString(),
              };
              return { data: { appointment } };
            });

            // Book all appointments
            const results: Appointment[] = [];
            for (const num of slotNums) {
              const result = await pantryService.bookAppointment({ slot_id: `slot-${num}` });
              results.push(result);
            }

            // Verify all appointments were booked successfully
            expect(results).toHaveLength(slotNums.length);
            results.forEach((result) => {
              expect(result.status).toBe('scheduled');
              expect(result).toHaveProperty('appointment_id');
              expect(result).toHaveProperty('appointment_time');
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should preserve appointment data integrity (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          async (slotNum) => {
            const slot_id = `slot-${slotNum}`;
            const appointment_id = `apt-${slotNum}`;
            const student_id = `student-${slotNum}`;
            const createdAt = new Date().toISOString();
            const appointmentTime = new Date().toISOString();

            const mockAppointment: Appointment = {
              appointment_id,
              student_id,
              slot_id,
              status: 'scheduled',
              created_at: createdAt,
              appointment_time: appointmentTime,
            };

            vi.mocked(api.post).mockImplementation(async () => ({
              data: { appointment: mockAppointment },
            }));

            const result = await pantryService.bookAppointment({ slot_id });

            // Verify all data is preserved
            expect(result.appointment_id).toBe(appointment_id);
            expect(result.student_id).toBe(student_id);
            expect(result.slot_id).toBe(slot_id);
            expect(result.status).toBe('scheduled');
            expect(result.created_at).toBe(createdAt);
            expect(result.appointment_time).toBe(appointmentTime);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return appointment that can be added to list (Property 28)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 5 }),
          async (slotNums) => {
            const appointments: Appointment[] = [];

            for (const num of slotNums) {
              const mockAppointment: Appointment = {
                appointment_id: `apt-${num}`,
                student_id: 'student-123',
                slot_id: `slot-${num}`,
                status: 'scheduled',
                created_at: new Date().toISOString(),
                appointment_time: new Date().toISOString(),
              };

              vi.mocked(api.post).mockImplementation(async () => ({
                data: { appointment: mockAppointment },
              }));

              const result = await pantryService.bookAppointment({ slot_id: `slot-${num}` });
              appointments.push(result);
            }

            // Verify all appointments can be stored in a list
            expect(appointments).toHaveLength(slotNums.length);
            appointments.forEach((apt) => {
              expect(apt).toHaveProperty('appointment_id');
              expect(apt).toHaveProperty('status');
              expect(apt).toHaveProperty('appointment_time');
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
