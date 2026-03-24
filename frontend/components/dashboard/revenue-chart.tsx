'use client';

// Monthly revenue line chart — fetches /api/analytics/revenue/
// Shows VND revenue trend over last 12 months

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCurrencyAbbr, formatMonth } from '@/lib/format-utils';
import type { MonthlyRevenue } from '@/lib/services/analytics-service';

interface RevenueChartProps {
  data: MonthlyRevenue[];
  loading?: boolean;
}

// Custom tooltip to show exact VND amount
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-card p-3 text-sm shadow-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-emerald-600">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  // Transform API data: convert month key to display label
  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }));

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle>Doanh thu theo tháng</CardTitle>
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
            <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrencyAbbr}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
