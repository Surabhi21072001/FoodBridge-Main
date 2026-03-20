import React from 'react';
import type { TimeSlot } from '../../types/pantry';
import Card, { CardBody } from '../shared/Card';
import Button from '../shared/Button';

export interface AppointmentSlotsProps {
  slots: TimeSlot[];
  onSelect: (slotId: string) => void;
  selectedSlot: string | null;
  isLoading?: boolean;
  onBook?: () => void;
  isBooking?: boolean;
}

const AppointmentSlots: React.FC<AppointmentSlotsProps> = ({
  slots,
  onSelect,
  selectedSlot,
  isLoading = false,
  onBook,
  isBooking = false,
}) => {
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

  if (isLoading) {
    return (
      <Card data-testid="appointment-slots-loading">
        <CardBody className="py-8">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 rounded animate-pulse"
                data-testid="slot-skeleton"
              />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card data-testid="appointment-slots-empty">
        <CardBody className="text-center py-8">
          <p className="text-gray-500 text-lg">No available slots</p>
          <p className="text-gray-400 text-sm mt-2">Please check back later</p>
        </CardBody>
      </Card>
    );
  }

  // Group slots by date label
  const grouped: { label: string; slots: typeof slots }[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayStr = today.toDateString();
  const tomorrowStr = tomorrow.toDateString();

  for (const slot of slots) {
    const d = new Date(slot.slot_time);
    const ds = d.toDateString();
    const label =
      ds === todayStr ? 'Today' : ds === tomorrowStr ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const group = grouped.find((g) => g.label === label);
    if (group) {
      group.slots.push(slot);
    } else {
      grouped.push({ label, slots: [slot] });
    }
  }

  return (
    <Card data-testid="appointment-slots">
      <CardBody>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Slots</h2>
        <div className="space-y-6">
          {grouped.map(({ label, slots: groupSlots }) => (
            <div key={label}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.slot_id;
                  const isBooked = slot.is_booked;

                  return (
                    <button
                      key={slot.slot_id}
                      onClick={() => !isBooked && onSelect(slot.slot_id)}
                      disabled={isBooked}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isBooked
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                      }`}
                      data-testid={`slot-${slot.slot_id}`}
                      aria-pressed={isSelected}
                      aria-disabled={isBooked}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {formatSlotTime(slot.slot_time)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {isBooked ? 'Booked' : 'Available'}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 flex-shrink-0 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : isBooked
                                ? 'border-gray-300 bg-gray-100'
                                : 'border-gray-300 bg-white'
                          }`}
                          data-testid={`slot-indicator-${slot.slot_id}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
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
            </div>
          ))}
        </div>

        {/* Selection summary */}
        {selectedSlot && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected slot:</span>{' '}
                {formatSlotTime(
                  slots.find((s) => s.slot_id === selectedSlot)?.slot_time || ''
                )}
              </p>
            </div>
            {onBook && (
              <Button
                onClick={onBook}
                isLoading={isBooking}
                disabled={isBooking}
                className="w-full"
                data-testid="book-appointment-button"
              >
                {isBooking ? 'Booking...' : 'Book Appointment'}
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AppointmentSlots;
