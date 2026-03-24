'use client';

// Order status pie chart — derived from dashboard stats or order-trends data
// Shows distribution of orders across all statuses

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber } from '@/lib/format-utils';

// Status color palette — consistent across all chart components
export const STATUS_COLORS: Record<string, string> = {
  pending:   '#f59e0b',
  confirmed: '#3b82f6',
  producing: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

// Vietnamese labels for order statuses
export const STATUS_LABELS: Record<string, string> = {
  pending:   'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  producing: 'Đang sản xuất',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export interface StatusDataPoint {
  status: string;
  count: number;
}

interface OrderStatusChartProps {
  data: StatusDataPoint[];
  loading?: boolean;
}

// Custom tooltip
function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-card p-3 text-sm shadow-sm">
      <p className="font-medium mb-1">{payload[0].name}</p>
      <p>{formatNumber(payload[0].value)} đơn hàng</p>
    </div>
  );
}

export default function OrderStatusChart({ data, loading = false }: OrderStatusChartProps) {
  // Map to recharts-friendly format
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? '#94a3b8',
  }));

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle>Trạng thái đơn hàng</CardTitle>
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
