import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AppointmentSlots from './AppointmentSlots';
import type { TimeSlot } from '../../types/pantry';

describe('AppointmentSlots Component', () => {
  const mockSlots: TimeSlot[] = [
    {
      slot_id: 'slot-1',
      slot_time: '2024-03-15T10:00:00Z',
      is_booked: false,
    },
    {
      slot_id: 'slot-2',
      slot_time: '2024-03-15T11:00:00Z',
      is_booked: false,
    },
    {
      slot_id: 'slot-3',
      slot_time: '2024-03-15T12:00:00Z',
      is_booked: true,
    },
    {
      slot_id: 'slot-4',
      slot_time: '2024-03-15T13:00:00Z',
      is_booked: false,
    },
  ];

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all available slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      expect(screen.getByTestId('appointment-slots')).toBeInTheDocument();
      mockSlots.forEach((slot) => {
        expect(screen.getByTestId(`slot-${slot.slot_id}`)).toBeInTheDocument();
      });
    });

    it('should display formatted slot times', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      // Check that times are formatted (should contain month abbreviation and time)
      const slotButtons = screen.getAllByTestId(/^slot-slot-/);
      expect(slotButtons.length).toBe(mockSlots.length);
    });

    it('should display empty state when no slots available', () => {
      render(
        <AppointmentSlots
          slots={[]}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      expect(screen.getByTestId('appointment-slots-empty')).toBeInTheDocument();
      expect(screen.getByText('No available slots')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('appointment-slots-loading')).toBeInTheDocument();
      expect(screen.getAllByTestId('slot-skeleton')).toHaveLength(4);
    });
  });

  describe('Slot Selection', () => {
    it('should call onSelect when clicking an available slot', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot1Button = screen.getByTestId('slot-slot-1');
      fireEvent.click(slot1Button);

      expect(mockOnSelect).toHaveBeenCalledWith('slot-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelect when clicking a booked slot', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot3Button = screen.getByTestId('slot-slot-3');
      fireEvent.click(slot3Button);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should highlight the selected slot', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      const slot1Button = screen.getByTestId('slot-slot-1');
      expect(slot1Button).toHaveClass('border-blue-500', 'bg-blue-50');
    });

    it('should display selection indicator for selected slot', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      const indicator = screen.getByTestId('slot-indicator-slot-1');
      expect(indicator).toHaveClass('border-blue-500', 'bg-blue-500');
    });

    it('should display selection summary when slot is selected', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      expect(screen.getByText(/Selected slot:/)).toBeInTheDocument();
    });

    it('should not display selection summary when no slot is selected', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      expect(screen.queryByText(/Selected slot:/)).not.toBeInTheDocument();
    });
  });

  describe('Booked Slots', () => {
    it('should disable booked slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot3Button = screen.getByTestId('slot-slot-3');
      expect(slot3Button).toBeDisabled();
    });

    it('should display booked status for booked slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const bookedSlotButtons = screen.getAllByText('Booked');
      expect(bookedSlotButtons.length).toBeGreaterThan(0);
    });

    it('should display available status for available slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const availableSlotButtons = screen.getAllByText('Available');
      expect(availableSlotButtons.length).toBeGreaterThan(0);
    });

    it('should apply disabled styling to booked slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot3Button = screen.getByTestId('slot-slot-3');
      expect(slot3Button).toHaveClass('opacity-60', 'cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes for selected slot', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      const slot1Button = screen.getByTestId('slot-slot-1');
      expect(slot1Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed false for unselected slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      const slot2Button = screen.getByTestId('slot-slot-2');
      expect(slot2Button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-disabled for booked slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot3Button = screen.getByTestId('slot-slot-3');
      expect(slot3Button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-disabled false for available slots', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot1Button = screen.getByTestId('slot-slot-1');
      expect(slot1Button).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Multiple Selections', () => {
    it('should allow selecting different slots sequentially', () => {
      render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      const slot1Button = screen.getByTestId('slot-slot-1');
      const slot2Button = screen.getByTestId('slot-slot-2');

      fireEvent.click(slot1Button);
      expect(mockOnSelect).toHaveBeenCalledWith('slot-1');

      fireEvent.click(slot2Button);
      expect(mockOnSelect).toHaveBeenCalledWith('slot-2');
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it('should update highlighted slot when selectedSlot prop changes', () => {
      const { rerender } = render(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-1"
        />
      );

      let slot1Button = screen.getByTestId('slot-slot-1');
      expect(slot1Button).toHaveClass('border-blue-500');

      rerender(
        <AppointmentSlots
          slots={mockSlots}
          onSelect={mockOnSelect}
          selectedSlot="slot-2"
        />
      );

      slot1Button = screen.getByTestId('slot-slot-1');
      const slot2Button = screen.getByTestId('slot-slot-2');

      expect(slot1Button).not.toHaveClass('border-blue-500');
      expect(slot2Button).toHaveClass('border-blue-500');
    });
  });

  describe('Edge Cases', () => {
    it('should handle slots with invalid time format gracefully', () => {
      const slotsWithInvalidTime: TimeSlot[] = [
        {
          slot_id: 'slot-1',
          slot_time: 'invalid-date',
          is_booked: false,
        },
      ];

      render(
        <AppointmentSlots
          slots={slotsWithInvalidTime}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      expect(screen.getByTestId('slot-slot-1')).toBeInTheDocument();
    });

    it('should handle all slots being booked', () => {
      const allBookedSlots: TimeSlot[] = mockSlots.map((slot) => ({
        ...slot,
        is_booked: true,
      }));

      render(
        <AppointmentSlots
          slots={allBookedSlots}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      allBookedSlots.forEach((slot) => {
        const button = screen.getByTestId(`slot-${slot.slot_id}`);
        expect(button).toBeDisabled();
      });
    });

    it('should handle single slot', () => {
      const singleSlot: TimeSlot[] = [mockSlots[0]];

      render(
        <AppointmentSlots
          slots={singleSlot}
          onSelect={mockOnSelect}
          selectedSlot={null}
        />
      );

      expect(screen.getByTestId('slot-slot-1')).toBeInTheDocument();
    });
  });
});
