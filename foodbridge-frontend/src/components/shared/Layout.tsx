import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import Navigation from './Navigation';
import ChatWidget from '../chat/ChatWidget';
import ToastContainer from './ToastContainer';
import { useNotifications } from '../../hooks/useNotifications';
import useToast from '../../hooks/useToast';

export interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getUnreadCount } = useNotifications();
  const { toasts, dismissToast } = useToast();
  // Stable ref so the effect never re-runs due to getUnreadCount identity changes
  const getUnreadCountRef = useRef(getUnreadCount);
  getUnreadCountRef.current = getUnreadCount;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCountRef.current();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    fetchUnreadCount();

    // Set up polling for notification updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []); // empty deps — stable via ref

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Navigation unreadNotificationCount={unreadCount} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Chat Widget */}
      <ChatWidget />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2024 FoodBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
