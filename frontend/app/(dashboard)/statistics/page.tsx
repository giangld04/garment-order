'use client';

// Statistics page — detailed analytics with date range filter and monthly breakdown table
// Reuses dashboard chart components with optional date filtering

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RevenueChart from '@/components/dashboard/revenue-chart';
import OrderStatusChart, { type StatusDataPoint } from '@/components/dashboard/order-status-chart';
import OrderTrendChart from '@/components/dashboard/order-trend-chart';
import PredictionChart from '@/components/dashboard/prediction-chart';
import {
  analyticsService,
  type MonthlyRevenue,
  type OrderTrendEntry,
} from '@/lib/services/analytics-service';
import { formatCurrency, formatNumber, formatMonth } from '@/lib/format-utils';

// Aggregate trend data per month for the summary table
function buildMonthlyTable(revenue: MonthlyRevenue[], trends: OrderTrendEntry[]) {
  const revenueMap: Record<string, number> = {};
  for (const r of revenue) revenueMap[r.month] = r.revenue;

  const orderCountMap: Record<string, number> = {};
  for (const t of trends) {
    orderCountMap[t.month] = (orderCountMap[t.month] ?? 0) + t.count;
  }

  const months = Array.from(
    new Set([...Object.keys(revenueMap), ...Object.keys(orderCountMap)])
  ).sort();

  return months.map((month) => ({
    month,
    monthLabel: formatMonth(month),
    revenue: revenueMap[month] ?? 0,
    orders: orderCountMap[month] ?? 0,
  }));
}

function deriveStatusData(trends: OrderTrendEntry[]): StatusDataPoint[] {
  const totals: Record<string, number> = {};
  for (const entry of trends) {
    totals[entry.status] = (totals[entry.status] ?? 0) + entry.count;
  }
  return Object.entries(totals).map(([status, count]) => ({ status, count }));
}

export default function StatisticsPage() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [trends, setTrends] = useState<OrderTrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range filter state (YYYY-MM-DD)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchData(start?: string, end?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...(start ? { start_date: start } : {}),
        ...(end ? { end_date: end } : {}),
      };
      const [revRes, trendRes] = await Promise.all([
        analyticsService.revenue(),
        analyticsService.orderTrends(params),
      ]);
      setRevenue(revRes.data);
      setTrends(trendRes.data);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // Initial load without filters
  useEffect(() => { fetchData(); }, []);

  const handleFilter = () => fetchData(startDate || undefined, endDate || undefined);
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchData();
  };

  const statusData = deriveStatusData(trends);
  const tableRows = buildMonthlyTable(revenue, trends);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thống kê</h1>

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Từ ngày</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Đến ngày</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleFilter} disabled={loading}>
              Lọc
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Revenue + Status charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} loading={loading} />
        </div>
        <div>
          <OrderStatusChart data={statusData} loading={loading} />
        </div>
      </div>

      {/* Order trend bar chart */}
      <OrderTrendChart data={trends} loading={loading} />

      {/* ML Prediction chart */}
      <PredictionChart />

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle>Bảng chi tiết theo tháng</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : tableRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tháng</TableHead>
                  <TableHead className="text-right">Số đơn hàng</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.monthLabel}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.orders)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
