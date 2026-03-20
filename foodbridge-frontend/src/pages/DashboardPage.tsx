import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import ProviderDashboard from '../components/dashboard/ProviderDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'provider') {
    return <ProviderDashboard />;
  }

  return <StudentDashboard />;
};

export default DashboardPage;
