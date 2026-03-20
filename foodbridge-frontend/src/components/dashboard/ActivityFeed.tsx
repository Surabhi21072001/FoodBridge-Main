import React from 'react';

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  icon: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #e8d5c0' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0e0cc' }}>
        <h3 className="font-bold" style={{ fontFamily: '"Fira Sans", Helvetica, Arial, sans-serif', fontSize: '1.1rem', color: '#2d2d2d' }}>
          Recent Activity
        </h3>
      </div>
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: '#fdf6ee' }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: '#2d2d2d' }}>{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(item.time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
