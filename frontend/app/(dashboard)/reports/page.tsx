'use client';

// Reports page — export buttons, prediction chart, and order summary stats.

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ExportButtons from '@/components/reports/export-buttons';
import PredictionChart from '@/components/dashboard/prediction-chart';
import { analyticsService, type DashboardStats } from '@/lib/services/analytics-service';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface StatItemProps {
  label: string;
  value: string;
  loading: boolean;
}

function StatItem({ label, value, loading }: StatItemProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-28 mt-1" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Báo cáo &amp; Xuất dữ liệu</h1>

      {/* Export section */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle>Xuất báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Chọn khoảng thời gian và định dạng file để tải xuống báo cáo đơn hàng.
          </p>
          <ExportButtons />
        </CardContent>
      </Card>

      {/* Prediction chart */}
      <PredictionChart />

      {/* Summary stats */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle>Tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatItem
              label="Tổng đơn hàng"
              value={stats ? formatNumber(stats.total_orders) : '—'}
              loading={loading}
            />
            <StatItem
              label="Tổng doanh thu"
              value={stats ? formatCurrency(stats.total_revenue) : '—'}
              loading={loading}
            />
            <StatItem
              label="Khách hàng"
              value={stats ? formatNumber(stats.total_customers) : '—'}
              loading={loading}
            />
            <StatItem
              label="Đơn chờ xử lý"
              value={stats ? formatNumber(stats.pending_orders) : '—'}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
