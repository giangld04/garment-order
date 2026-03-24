'use client';

// Reusable stat card — icon, title, value, optional sub-label
// Used in dashboard top row for key metrics

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subLabel?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  subLabel,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div className={`rounded-md bg-muted p-2.5 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Text */}
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold leading-tight">{value}</p>
            {subLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
