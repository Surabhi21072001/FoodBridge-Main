import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import metricsService, { type ProviderMetrics } from '../services/metricsService';

type Tab = 'sustainability' | 'community' | 'customer' | 'revenue';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'sustainability', label: 'Sustainability', icon: '🌱' },
  { id: 'community', label: 'Community Engagement', icon: '🤝' },
  { id: 'customer', label: 'Customer Engagement', icon: '⭐' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
];

const COLORS = {
  sustainability: ['#22c55e', '#86efac', '#d1fae5'],
  community: ['#3b82f6', '#93c5fd', '#dbeafe'],
  customer: ['#f59e0b', '#fcd34d', '#fef3c7'],
  revenue: ['#8b5cf6', '#c4b5fd', '#ede9fe'],
};

interface DonutChartProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  colors: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ label, value, target, unit, colors }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const filled = Math.min(value, target);
  const remaining = Math.max(target - value, 0);
  const data = [
    { name: label, value: filled },
    { name: 'Remaining', value: remaining },
  ];
  const pct = Math.round((filled / target) * 100);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm font-semibold text-gray-700 mb-2 text-center">{label}</p>
      <div className="relative w-full" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? colors[0] : '#e5e7eb'}
                  opacity={activeIndex !== null && activeIndex !== i ? 0.6 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) =>
                [`${val ?? 0} ${unit}`, name as string]
              }
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-800">{pct}%</span>
          <span className="text-xs text-gray-500">of goal</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {value} / {target} {unit}
      </p>
    </div>
  );
};

interface GoalBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

const GoalBar: React.FC<GoalBarProps> = ({ label, value, target, unit, color }) => {
  const pct = Math.min(Math.round((value / target) * 100), 100);
  const isOnTrack = pct >= 70;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {value} / {target} {unit} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isOnTrack ? color : pct >= 40 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>
    </div>
  );
};

interface InsightCardProps {
  icon: string;
  title: string;
  message: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon, title, message }) => (
  <div className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <p className="text-gray-600 text-sm mt-0.5">{message}</p>
    </div>
  </div>
);

// Skeleton loader for charts
const ChartSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
        <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-4" />
      </div>
    ))}
  </div>
);

const MetricsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sustainability');
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await metricsService.getProviderMetrics();
        setMetrics(data);
      } catch {
        setError('Unable to load metrics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const renderContent = () => {
    if (isLoading) return <ChartSkeleton />;
    if (error) return (
      <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-200">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
    if (!metrics) return (
      <div className="text-center py-12 text-gray-500">No data available for this metric.</div>
    );

    if (activeTab === 'sustainability') {
      const s = metrics.sustainability;
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DonutChart label="Carbon Footprint" {...s.carbonFootprint} colors={COLORS.sustainability} />
            <DonutChart label="Sustainable Ingredients" {...s.sustainableIngredients} colors={COLORS.sustainability} />
            <DonutChart label="Waste Reduction" {...s.wasteReduction} colors={COLORS.sustainability} />
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Goal Progress</h3>
            <GoalBar label="Carbon Footprint Goal" {...s.carbonFootprint} color="#22c55e" />
            <GoalBar label="Sustainable Ingredients Target" {...s.sustainableIngredients} color="#22c55e" />
            <GoalBar label="Waste Reduction Target" {...s.wasteReduction} color="#22c55e" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InsightCard icon="♻️" title="Reduce Carbon Emissions" message="Focus on reducing carbon emissions by 10% next quarter through local sourcing." />
            <InsightCard icon="🥦" title="Boost Sustainable Ingredients" message="Increase sustainable ingredient usage to reach your 100% target by end of year." />
            <InsightCard icon="🗑️" title="Waste Reduction Opportunity" message="Partner with local composting services to improve your waste reduction score." />
          </div>
        </div>
      );
    }

    if (activeTab === 'community') {
      const c = metrics.community;
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DonutChart label="Food Donations" {...c.foodDonations} colors={COLORS.community} />
            <DonutChart label="Volunteer Hours" {...c.volunteerHours} colors={COLORS.community} />
            <DonutChart label="Partnerships" {...c.partnerships} colors={COLORS.community} />
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Goal Progress</h3>
            <GoalBar label="Food Donations Target" {...c.foodDonations} color="#3b82f6" />
            <GoalBar label="Volunteer Hours Goal" {...c.volunteerHours} color="#3b82f6" />
            <GoalBar label="Partnerships Goal" {...c.partnerships} color="#3b82f6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InsightCard icon="🍱" title="Increase Food Donations" message="Increase food donations to improve community engagement and reach your 500-meal target." />
            <InsightCard icon="🙋" title="Recruit More Volunteers" message="You're 60 hours short of your volunteer goal — consider hosting a volunteer drive." />
            <InsightCard icon="🤝" title="Expand Partnerships" message="Reach out to 7 more organizations to hit your partnership target this quarter." />
          </div>
        </div>
      );
    }

    if (activeTab === 'customer') {
      const cu = metrics.customer;
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DonutChart label="Customer Satisfaction" {...cu.satisfaction} colors={COLORS.customer} />
            <DonutChart label="Customer Retention" {...cu.retention} colors={COLORS.customer} />
            <DonutChart label="Feedback Engagement" {...cu.feedbackEngagement} colors={COLORS.customer} />
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Goal Progress</h3>
            <GoalBar label="Satisfaction Score" {...cu.satisfaction} color="#f59e0b" />
            <GoalBar label="Retention Rate" {...cu.retention} color="#f59e0b" />
            <GoalBar label="Feedback Engagement" {...cu.feedbackEngagement} color="#f59e0b" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InsightCard icon="😊" title="Improve Satisfaction" message="Address top complaints in feedback to push satisfaction above 90%." />
            <InsightCard icon="🔄" title="Boost Retention" message="Introduce a loyalty program to improve your 67% retention rate." />
            <InsightCard icon="💬" title="Drive Feedback" message="Send follow-up prompts after orders to increase feedback engagement." />
          </div>
        </div>
      );
    }

    if (activeTab === 'revenue') {
      const r = metrics.revenue;
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DonutChart label="Revenue Breakdown" {...r.revenueBreakdown} colors={COLORS.revenue} />
            <DonutChart label="Revenue Growth" {...r.revenueGrowth} colors={COLORS.revenue} />
            <DonutChart label="Avg Revenue per User" {...r.arpu} colors={COLORS.revenue} />
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Goal Progress</h3>
            <GoalBar label="Revenue Target" {...r.revenueBreakdown} color="#8b5cf6" />
            <GoalBar label="Growth Target" {...r.revenueGrowth} color="#8b5cf6" />
            <GoalBar label="ARPU Target" {...r.arpu} color="#8b5cf6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InsightCard icon="📈" title="Accelerate Revenue Growth" message="You're at 18% growth — upsell premium listings to close the gap to 30%." />
            <InsightCard icon="👤" title="Increase ARPU" message="Introduce tiered pricing or add-ons to raise average revenue per user from $24 to $40." />
            <InsightCard icon="💡" title="Diversify Revenue" message="Explore catering partnerships to add a new revenue stream this quarter." />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Metrics Dashboard</h1>
        <p className="mt-1 text-gray-500">Track your sustainability, engagement, and revenue performance.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus:outline-none"
              style={{
                backgroundColor: isActive ? '#fff' : 'transparent',
                color: isActive ? '#ff6b35' : '#6b7280',
                borderBottom: isActive ? '2px solid #ff6b35' : '2px solid transparent',
                marginBottom: '-1px',
              }}
              aria-selected={isActive}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel">{renderContent()}</div>
    </div>
  );
};

export default MetricsPage;
