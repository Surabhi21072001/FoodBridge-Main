import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const GoogleCalendarConnect: React.FC = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await apiClient.get('/auth/google/calendar/status');
      setConnected(res.data.connected);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    // Pass token as query param since browser redirects can't set headers
    window.location.href = `${apiBase}/auth/google/calendar?token=${token}`;
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await apiClient.delete('/auth/google/calendar');
      setConnected(false);
    } catch {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Checking Google Calendar status...</p>;
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white" style={{ maxWidth: '480px' }}>
      <div className="flex items-center gap-3">
        {/* Google Calendar icon */}
        <svg className="w-8 h-8" viewBox="0 0 48 48" aria-hidden="true">
          <rect width="48" height="48" rx="8" fill="#fff" />
          <rect x="6" y="6" width="36" height="36" rx="4" fill="#4285F4" />
          <rect x="6" y="14" width="36" height="28" rx="0" fill="#fff" />
          <rect x="6" y="14" width="36" height="8" fill="#4285F4" />
          <rect x="14" y="6" width="4" height="8" rx="2" fill="#4285F4" />
          <rect x="30" y="6" width="4" height="8" rx="2" fill="#4285F4" />
          <text x="24" y="36" textAnchor="middle" fontSize="12" fill="#4285F4" fontWeight="bold">
            {new Date().getDate()}
          </text>
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900">Google Calendar</p>
          <p className="text-xs text-gray-500">
            {connected ? 'Connected — appointments auto-save to your calendar' : 'Connect to auto-save pantry appointments'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        {connected ? (
          <>
            <span className="text-xs text-green-600 font-medium">✓ Connected</span>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-xs text-gray-500 hover:text-red-600 underline disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors"
            style={{ backgroundColor: '#2563eb' }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarConnect;
