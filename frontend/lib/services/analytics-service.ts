// Analytics API service — wraps all /api/analytics/* endpoints

import apiClient from '@/lib/api-client';

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  pending_orders: number;
  producing_orders: number;
}

export interface MonthlyRevenue {
  month: string;   // "YYYY-MM"
  revenue: number;
}

export interface OrderTrendEntry {
  month: string;   // "YYYY-MM"
  status: string;
  count: number;
}

export interface PredictionPoint {
  month: string;        // "YYYY-MM"
  predicted_count: number;
  is_prediction: boolean;
}

export const analyticsService = {
  /** GET /api/analytics/dashboard/ → summary stats */
  dashboard: () => apiClient.get<DashboardStats>('/analytics/dashboard/'),

  /** GET /api/analytics/revenue/ → monthly revenue list */
  revenue: () => apiClient.get<MonthlyRevenue[]>('/analytics/revenue/'),

  /** GET /api/analytics/order-trends/ → monthly order counts by status */
  orderTrends: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<OrderTrendEntry[]>('/analytics/order-trends/', { params }),

  /** GET /api/analytics/predict/ → next 3 months order volume predictions */
  predict: () => apiClient.get<{ predictions: PredictionPoint[] }>('/analytics/predict/'),
};
