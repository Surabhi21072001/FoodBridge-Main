import apiClient from './apiClient';

export interface MetricValue {
  value: number;
  target: number;
  unit: string;
}

export interface ProviderMetrics {
  sustainability: {
    carbonFootprint: MetricValue;
    sustainableIngredients: MetricValue;
    wasteReduction: MetricValue;
  };
  community: {
    foodDonations: MetricValue;
    volunteerHours: MetricValue;
    partnerships: MetricValue;
  };
  customer: {
    satisfaction: MetricValue;
    retention: MetricValue;
    feedbackEngagement: MetricValue;
  };
  revenue: {
    revenueBreakdown: MetricValue;
    revenueGrowth: MetricValue;
    arpu: MetricValue;
  };
}

const metricsService = {
  async getProviderMetrics(): Promise<ProviderMetrics> {
    const response = await apiClient.get<{ success: boolean; data: ProviderMetrics }>(
      '/provider/metrics'
    );
    return response.data.data;
  },
};

export default metricsService;
