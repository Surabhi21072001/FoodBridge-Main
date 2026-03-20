import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileForm from '../components/profile/ProfileForm';
import PreferencesForm from '../components/profile/PreferencesForm';
import GoogleCalendarConnect from '../components/profile/GoogleCalendarConnect';
import useToast from '../hooks/useToast';

type TabType = 'profile' | 'preferences';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('calendar') === 'connected') {
      showToast('Google Calendar connected successfully!', 'success');
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleFormSuccess = () => {
    // Forms handle their own success messages via toast
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account information and preferences.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            aria-selected={activeTab === 'profile'}
            role="tab"
          >
            Account Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            aria-selected={activeTab === 'preferences'}
            role="tab"
          >
            Preferences & Notifications
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <ProfileForm onSuccess={handleFormSuccess} />
      )}

      {activeTab === 'preferences' && (
        <PreferencesForm onSuccess={handleFormSuccess} />
      )}

      {/* Google Calendar Integration */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-sm text-gray-600 mb-4">Connect third-party services to enhance your experience.</p>
        <GoogleCalendarConnect />
      </div>
    </div>
  );
};

export default ProfilePage;
