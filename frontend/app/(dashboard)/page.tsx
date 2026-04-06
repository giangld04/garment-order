'use client';

// Dashboard homepage — stat cards + three analytics charts
// Data: /api/analytics/dashboard/, /api/analytics/revenue/, /api/analytics/order-trends/

import { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Users, Clock, Factory } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import RevenueChart from '@/components/dashboard/revenue-chart';
import OrderStatusChart, { type StatusDataPoint } from '@/components/dashboard/order-status-chart';
import OrderTrendChart from '@/components/dashboard/order-trend-chart';
import LowStockAlertCard from '@/components/dashboard/low-stock-alert-card';
import {
  analyticsService,
  type DashboardStats,
  type MonthlyRevenue,
  type OrderTrendEntry,
} from '@/lib/services/analytics-service';
import { materialService } from '@/lib/services/material-service';
import { formatCurrency, formatNumber } from '@/lib/format-utils';
import type { Material } from '@/types/material';

// Derive status counts from order-trends data (sum all months per status)
function deriveStatusData(trends: OrderTrendEntry[]): StatusDataPoint[] {
  const totals: Record<string, number> = {};
  for (const entry of trends) {
    totals[entry.status] = (totals[entry.status] ?? 0) + entry.count;
  }
  return Object.entries(totals).map(([status, count]) => ({ status, count }));
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [trends, setTrends] = useState<OrderTrendEntry[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, revRes, trendRes, lowStockRes] = await Promise.all([
          analyticsService.dashboard(),
          analyticsService.revenue(),
          analyticsService.orderTrends(),
          materialService.lowStock(),
        ]);
        if (!cancelled) {
          setStats(dashRes.data);
          setRevenue(revRes.data);
          setTrends(trendRes.data);
          setLowStockMaterials(lowStockRes.data);
        }
      } catch {
        if (!cancelled) setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const statusData = deriveStatusData(trends);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Trang chủ</h1>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Tổng đơn hàng"
          value={stats ? formatNumber(stats.total_orders) : '—'}
          icon={ShoppingCart}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatCard
          title="Doanh thu"
          value={stats ? formatCurrency(stats.total_revenue) : '—'}
          icon={DollarSign}
          iconColor="text-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Khách hàng"
          value={stats ? formatNumber(stats.total_customers) : '—'}
          icon={Users}
          iconColor="text-violet-500"
          loading={loading}
        />
        <StatCard
          title="Chờ xử lý"
          value={stats ? formatNumber(stats.pending_orders) : '—'}
          icon={Clock}
          iconColor="text-amber-500"
          loading={loading}
        />
        <StatCard
          title="Đang sản xuất"
          value={stats ? formatNumber(stats.producing_orders) : '—'}
          icon={Factory}
          iconColor="text-purple-500"
          loading={loading}
          // Hide on small grids — visible on xl only
        />
      </div>

      {/* Charts row: revenue (wider) + status pie */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} loading={loading} />
        </div>
        <div>
          <OrderStatusChart data={statusData} loading={loading} />
        </div>
      </div>

      {/* Full-width bar chart */}
      <OrderTrendChart data={trends} loading={loading} />

      {/* Low-stock alert */}
      <LowStockAlertCard materials={lowStockMaterials} loading={loading} />
    </div>
  );
}
