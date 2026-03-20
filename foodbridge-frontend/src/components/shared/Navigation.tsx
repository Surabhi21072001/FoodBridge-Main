import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  unreadNotificationCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({ unreadNotificationCount = 0 }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navLinkStyle = (path: string): React.CSSProperties => {
    return isActive(path)
      ? { color: '#ff6b35', fontWeight: 600 }
      : { color: '#2d2d2d' };
  };

  const navLinkClass = (_path: string): string => {
    return 'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-orange-500';
  };

  const isProvider = user?.role === 'provider';

  return (
    <nav style={{ backgroundColor: '#fdf6ee', borderBottom: '1px solid #e8d5c0' }} className="shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="FoodBridge" style={{ height: '80px', width: 'auto' }} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClass('/')} style={navLinkStyle('/')}>
              Dashboard
            </Link>
            <Link to="/listings" className={navLinkClass('/listings')} style={navLinkStyle('/listings')}>
              Listings
            </Link>
            {!isProvider && (
              <Link to="/reservations" className={navLinkClass('/reservations')} style={navLinkStyle('/reservations')}>
                My Orders
              </Link>
            )}
            {!isProvider && (
              <Link to="/pantry" className={navLinkClass('/pantry')} style={navLinkStyle('/pantry')}>
                Pantry
              </Link>
            )}
            {isProvider ? (
              <Link to="/metrics" className={navLinkClass('/metrics')} style={navLinkStyle('/metrics')}>
                Metrics
              </Link>
            ) : (
              <Link to="/events" className={navLinkClass('/events')} style={navLinkStyle('/events')}>
                Events
              </Link>
            )}
            <Link to="/profile" className={navLinkClass('/profile')} style={navLinkStyle('/profile')}>
              Profile
            </Link>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Badge */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-md transition-colors"
              style={{ color: '#2d2d2d' }}
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadNotificationCount > 0 && (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: '#ff6b35' }}
                  aria-label={`${unreadNotificationCount} unread notifications`}
                >
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                aria-label="Logout"
                style={{
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Badge */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-md transition-colors"
              style={{ color: '#2d2d2d' }}
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadNotificationCount > 0 && (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: '#ff6b35' }}
                  aria-label={`${unreadNotificationCount} unread notifications`}
                >
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Link>

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
              style={{ color: '#2d2d2d' }}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className={`h-6 w-6 transition-transform ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link
              to="/"
              className={`block ${navLinkClass('/')}`}
              style={navLinkStyle('/')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/listings"
              className={`block ${navLinkClass('/listings')}`}
              style={navLinkStyle('/listings')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Listings
            </Link>
            {!isProvider && (
              <Link
                to="/reservations"
                className={`block ${navLinkClass('/reservations')}`}
                style={navLinkStyle('/reservations')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            {!isProvider && (
              <Link
                to="/pantry"
                className={`block ${navLinkClass('/pantry')}`}
                style={navLinkStyle('/pantry')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pantry
              </Link>
            )}
            {isProvider ? (
              <Link
                to="/metrics"
                className={`block ${navLinkClass('/metrics')}`}
                style={navLinkStyle('/metrics')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Metrics
              </Link>
            ) : (
              <Link
                to="/events"
                className={`block ${navLinkClass('/events')}`}
                style={navLinkStyle('/events')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
            )}
            <Link
              to="/profile"
              className={`block ${navLinkClass('/profile')}`}
              style={navLinkStyle('/profile')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="pt-4" style={{ borderTop: '1px solid #e8d5c0' }}>
              <div className="px-3 py-2 text-sm font-medium" style={{ color: '#2d2d2d' }}>
                {user?.email ? user.email.split('@')[0].split('.')[0].replace(/\b\w/g, c => c.toUpperCase()) : ''}
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                style={{
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '8px',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
