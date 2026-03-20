import React, { useEffect, useState, useRef } from 'react';
import useToast from '../hooks/useToast';
import pantryService from '../services/pantryService';
import type { PantryItem, TimeSlot, CartItem, Appointment } from '../types/pantry';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Button from '../components/shared/Button';
import Card, { CardBody } from '../components/shared/Card';
import AppointmentSlots from '../components/pantry/AppointmentSlots';
import PantryCart from '../components/pantry/PantryCart';
import PantryInventory from '../components/pantry/PantryInventory';
import SmartPantryCart from '../components/pantry/SmartPantryCart';

// Builds a Google Calendar "Add to Calendar" URL — no OAuth needed
function buildCalendarUrl(startTime: string): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=Pantry+Appointment+%E2%80%93+FoodBridge' +
    '&dates=' + fmt(start) + '/' + fmt(end) +
    '&details=Pantry+pickup+appointment+booked+via+FoodBridge.' +
    '&location=Campus+Food+Pantry'
  );
}

const PantryPage: React.FC = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<PantryItem[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [isCancelingAppointment, setIsCancelingAppointment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cart' | 'slots'>('cart');
  const hasInitialized = useRef(false);

  // Fetch pantry data on component mount
  useEffect(() => {
    // Prevent multiple API calls on component mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchPantryData = async () => {
      try {
        setIsLoading(true);

        // Fetch inventory
        try {
          const inventoryData = await pantryService.getInventory({ page: 1, limit: 20 });
          setInventory(inventoryData || []);
        } catch (error) {
          console.error('Error fetching inventory:', error);
          showToast('Failed to load inventory', 'error');
          setInventory([]);
        }

        // Fetch slots
        try {
          const slotsData = await pantryService.getAvailableSlots();
          setSlots(slotsData || []);
        } catch (error) {
          console.error('Error fetching slots:', error);
          showToast('Failed to load available slots', 'error');
          setSlots([]);
        }

        // Fetch user's appointments
        try {
          const appointmentsData = await pantryService.getAppointments({ page: 1, limit: 20 });
          setAppointments(appointmentsData || []);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          showToast('Failed to load appointments', 'error');
          setAppointments([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPantryData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleAddToCart = (item: PantryItem, quantity: number) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find((cartItem) => cartItem.item_id === item.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      updatedCart.push({
        item_id: item.id,
        item_name: item.item_name,
        quantity,
      });
    }

    setCart(updatedCart);
    showToast(`Added ${item.item_name} to cart`, 'success');
  };

  const handleAddMultipleToCart = (items: CartItem[]) => {
    const updatedCart = [...cart];
    items.forEach((newItem) => {
      const existingItem = updatedCart.find((item) => item.item_id === newItem.item_id);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        updatedCart.push(newItem);
      }
    });
    setCart(updatedCart);
    showToast(`Added ${items.length} item${items.length !== 1 ? 's' : ''} to cart`, 'success');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.item_id !== itemId));
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.item_id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Please add items to your cart before booking', 'error');
      return;
    }

    try {
      setIsBookingAppointment(true);
      // Find the selected slot to get the appointment_time
      const slot = slots.find((s) => s.slot_id === selectedSlot);
      if (!slot) {
        showToast('Selected slot not found', 'error');
        return;
      }

      const appointment = await pantryService.bookAppointment({
        appointment_time: slot.slot_time,
        duration_minutes: 60, // Default 1 hour appointment
      });
      setAppointments([...appointments, appointment]);
      setSelectedSlot(null);
      
      // Show success message with cart details
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      const itemsList = cart.map((item) => `${item.quantity}x ${item.item_name}`).join(', ');
      showToast(
        `✓ Successfully reserved ${itemCount} item${itemCount !== 1 ? 's' : ''}: ${itemsList}. Please pick up by today at your scheduled time by coming to the pantry.`,
        'success'
      );
      
      // Clear the cart after successful booking
      setCart([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      showToast('Failed to book appointment', 'error');
    } finally {
      setIsBookingAppointment(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setIsCancelingAppointment(appointmentId);
      await pantryService.cancelAppointment(appointmentId);
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
      showToast('Appointment cancelled successfully', 'success');
    } catch (error) {
      console.error('Error canceling appointment:', error);
      showToast('Failed to cancel appointment', 'error');
    } finally {
      setIsCancelingAppointment(null);
    }
  };

  const formatAppointmentTime = (appointmentTime: string): string => {
    try {
      const date = new Date(appointmentTime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return appointmentTime;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pantry</h1>
        <p className="mt-2 text-gray-600">Browse pantry inventory and book appointments.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add to Cart
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'slots'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Inventory and Smart Cart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Inventory Section */}
              <div data-testid="pantry-inventory-section">
                <PantryInventory
                  items={inventory}
                  onAddToCart={handleAddToCart}
                  isLoading={isLoading}
                />
              </div>

              {/* Smart Pantry Cart Section */}
              <SmartPantryCart onAddToCart={handleAddMultipleToCart} isLoading={isLoading} />
            </div>

            {/* Right Column: Cart - Sticky on desktop */}
            <div data-testid="pantry-cart-section" className="lg:sticky lg:top-6 lg:h-fit">
              <PantryCart
                items={cart}
                onRemove={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onCheckout={() => setActiveTab('slots')}
              />
            </div>
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Slots */}
            <div className="lg:col-span-2 space-y-6">
              {/* Available Slots Section */}
              <div data-testid="appointment-slots-section" className="space-y-4">
                <AppointmentSlots
                  slots={slots}
                  onSelect={setSelectedSlot}
                  selectedSlot={selectedSlot}
                  isLoading={isLoading}
                  onBook={handleBookAppointment}
                  isBooking={isBookingAppointment}
                />
              </div>

              {/* Appointments List Section */}
              <div data-testid="appointments-list-section">
                <Card>
                  <CardBody className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
                  </CardBody>

                  {appointments.length === 0 ? (
                    <CardBody className="text-center py-8">
                      <p className="text-gray-500 text-lg">No appointments scheduled</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Select a time slot above and book an appointment
                      </p>
                    </CardBody>
                  ) : (
                    <CardBody className="space-y-3">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          data-testid={`appointment-item-${appointment.id}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {formatAppointmentTime(appointment.appointment_time)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Status:{' '}
                              <span
                                className={`font-medium ${
                                  appointment.status === 'scheduled'
                                    ? 'text-green-700'
                                    : appointment.status === 'completed'
                                      ? 'text-blue-700'
                                      : 'text-red-700'
                                }`}
                              >
                                {appointment.status.charAt(0).toUpperCase() +
                                  appointment.status.slice(1)}
                              </span>
                            </p>
                          </div>

                          {appointment.status === 'scheduled' && (
                            <div className="flex items-center gap-2 ml-4">
                              <a
                                href={buildCalendarUrl(appointment.appointment_time)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                aria-label="Add appointment to Google Calendar"
                                data-testid={`add-to-calendar-${appointment.id}`}
                              >
                                📅 Add to Calendar
                              </a>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                isLoading={isCancelingAppointment === appointment.id}
                                disabled={isCancelingAppointment !== null}
                                data-testid={`cancel-appointment-button-${appointment.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardBody>
                  )}
                </Card>
              </div>
            </div>

            {/* Right Column: Empty for balance */}
            <div />
          </div>
        )}
      </div>
    </div>
  );
};

export default PantryPage;
