'use client';

// prediction-chart.tsx — Combined historical + ML-predicted order count line chart.
// Historical data: solid line. Predicted data: dashed line with different color.

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatMonth } from '@/lib/format-utils';
import apiClient from '@/lib/api-client';

interface HistoricalPoint {
  month: string;
  count: number;
}

interface PredictionPoint {
  month: string;
  predicted_count: number;
}

interface ChartPoint {
  monthLabel: string;
  historical?: number;
  predicted?: number;
}

// Custom tooltip showing either historical or predicted count
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-card p-3 text-sm shadow-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value} đơn
        </p>
      ))}
    </div>
  );
}

export default function PredictionChart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch historical order trends (all statuses aggregated by month)
        const [trendRes, predictRes] = await Promise.allSettled([
          apiClient.get<Array<{ month: string; count: number; status: string }>>('/analytics/order-trends/'),
          apiClient.get<{ predictions: PredictionPoint[] }>('/analytics/predict/'),
        ]);

        // Aggregate historical: sum all statuses per month
        const histMap: Record<string, number> = {};
        if (trendRes.status === 'fulfilled') {
          for (const entry of trendRes.value.data) {
            histMap[entry.month] = (histMap[entry.month] ?? 0) + entry.count;
          }
        }

        // Build combined chart points
        const points: ChartPoint[] = Object.entries(histMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({
            monthLabel: formatMonth(month),
            historical: count,
          }));

        // Attach predictions (no overlap with historical)
        if (predictRes.status === 'fulfilled') {
          for (const pred of predictRes.value.data.predictions) {
            points.push({
              monthLabel: formatMonth(pred.month),
              predicted: pred.predicted_count,
            });
          }
        }

        setChartData(points);
      } catch {
        setError('Không thể tải dữ liệu dự báo.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle>Xu hướng đơn hàng &amp; Dự báo</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-md" />
        ) : error ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-destructive">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="historical"
                name="Thực tế"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Dự báo"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
