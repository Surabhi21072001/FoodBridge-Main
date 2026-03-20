import React, { useState } from 'react';
import type { TimeSlot } from '../../types/pantry';

export interface CompactAppointmentSlotsProps {
  slots: TimeSlot[];
}

/**
 * Compact version of AppointmentSlots for displaying in chat results.
 * Shows available appointment slots in a condensed format suitable for chat display.
 * Requirement 10.6: Display tool results in a formatted manner
 */
const CompactAppointmentSlots: React.FC<CompactAppointmentSlotsProps> = ({ slots }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const formatSlotTime = (slotTime: string): string => {
    try {
      const date = new Date(slotTime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return slotTime;
    }
  };

  if (slots.length === 0) {
    return (
      <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-500">
        No available slots
      </div>
    );
  }

  // Count available slots
  const availableCount = slots.filter((s) => !s.is_booked).length;

  return (
    <div
      className="p-3 bg-white border border-gray-200 rounded-lg"
      data-testid="compact-appointment-slots"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">Available Slots</h4>
        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {availableCount} available
        </span>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-2 gap-2">
        {slots.slice(0, 6).map((slot) => {
          const isSelected = selectedSlot === slot.slot_id;
          const isBooked = slot.is_booked;

          return (
            <button
              key={slot.slot_id}
              onClick={() => !isBooked && setSelectedSlot(slot.slot_id)}
              disabled={isBooked}
              className={`p-2 rounded-lg border text-left transition-all text-xs ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isBooked
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
              }`}
              data-testid={`compact-slot-${slot.slot_id}`}
              aria-pressed={isSelected}
              aria-disabled={isBooked}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {formatSlotTime(slot.slot_time)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isBooked ? 'Booked' : 'Available'}
                  </p>
                </div>

                {/* Selection indicator */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ml-1 flex-shrink-0 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : isBooked
                        ? 'border-gray-300 bg-gray-100'
                        : 'border-gray-300 bg-white'
                  }`}
                  data-testid={`compact-slot-indicator-${slot.slot_id}`}
                >
                  {isSelected && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {slots.length > 6 && (
        <div className="text-xs text-gray-500 text-center py-2">
          +{slots.length - 6} more slots available
        </div>
      )}

      {/* Selection summary */}
      {selectedSlot && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-medium">
            Selected: {formatSlotTime(
              slots.find((s) => s.slot_id === selectedSlot)?.slot_time || ''
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompactAppointmentSlots;
