'use client';

// Monthly order count bar chart — grouped by status
// Fetches from /api/analytics/order-trends/
// Shows color-coded bars per order status

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatMonth } from '@/lib/format-utils';
import { STATUS_COLORS, STATUS_LABELS } from './order-status-chart';
import type { OrderTrendEntry } from '@/lib/services/analytics-service';

interface OrderTrendChartProps {
  data: OrderTrendEntry[];
  loading?: boolean;
}

// Pivot flat trend data [{month, status, count}] → [{month, pending, confirmed, ...}]
function pivotTrendData(data: OrderTrendEntry[]) {
  const byMonth: Record<string, Record<string, number>> = {};
  for (const entry of data) {
    if (!byMonth[entry.month]) byMonth[entry.month] = {};
    byMonth[entry.month][entry.status] = (byMonth[entry.month][entry.status] ?? 0) + entry.count;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => ({
      monthLabel: formatMonth(month),
      ...counts,
    }));
}

// Detect which statuses appear in the data set
function getStatuses(data: OrderTrendEntry[]): string[] {
  const seen = new Set<string>();
  for (const entry of data) seen.add(entry.status);
  // Return in defined order
  const order = ['pending', 'confirmed', 'producing', 'completed', 'cancelled'];
  return order.filter((s) => seen.has(s));
}

export default function OrderTrendChart({ data, loading = false }: OrderTrendChartProps) {
  const chartData = pivotTrendData(data);
  const statuses = getStatuses(data);

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle>Số đơn hàng theo tháng</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-md" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Legend
                formatter={(value) => (
                  <span className="text-xs">{STATUS_LABELS[value] ?? value}</span>
                )}
              />
              {statuses.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  name={status}
                  fill={STATUS_COLORS[status] ?? '#94a3b8'}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
