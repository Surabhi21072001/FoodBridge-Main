import React from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';

interface Stat {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

interface ProviderStatsCardsProps {
  activeListings: number;
  totalReservations: number;
  claimedToday: number;
  expiringSoon: number;
  loading: boolean;
}

const ProviderStatsCards: React.FC<ProviderStatsCardsProps> = ({
  activeListings,
  totalReservations,
  claimedToday,
  expiringSoon,
  loading,
}) => {
  const stats: Stat[] = [
    { title: 'Active Listings', value: activeListings, icon: '📋', color: '#ff6b35' },
    { title: 'Total Reservations', value: totalReservations, icon: '🎟️', color: '#2a7c6f' },
    { title: 'Claimed Today', value: claimedToday, icon: '✅', color: '#7c3aed' },
    { title: 'Expiring Soon', value: expiringSoon, icon: '⏰', color: '#dc2626' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-2xl bg-white p-5 flex flex-col gap-2"
          style={{ border: '1px solid #e8d5c0' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${stat.color}18` }}
          >
            {stat.icon}
          </div>
          <div className="text-3xl font-bold" style={{ color: stat.color }}>
            {loading ? <LoadingSpinner size="sm" /> : stat.value}
          </div>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default ProviderStatsCards;
