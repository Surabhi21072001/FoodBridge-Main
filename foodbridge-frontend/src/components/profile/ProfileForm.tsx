import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormProps {
  onSuccess?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
          {user?.email || 'N/A'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 capitalize">
          {user?.role || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
