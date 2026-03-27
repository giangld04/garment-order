'use client';

// Dashboard widget showing count and names of low-stock materials

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Material } from '@/types/material';

interface LowStockAlertCardProps {
  materials: Material[];
  loading?: boolean;
}

export default function LowStockAlertCard({ materials, loading = false }: LowStockAlertCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={materials.length > 0 ? 'border-red-300 dark:border-red-800' : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className={`size-4 ${materials.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          Vật liệu sắp hết ({materials.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tất cả vật liệu đều đủ tồn kho.</p>
        ) : (
          <ul className="space-y-1">
            {materials.slice(0, 8).map((m) => (
              <li key={m.id} className="text-sm flex justify-between">
                <span className="font-medium text-red-600">{m.name}</span>
                <span className="text-muted-foreground">
                  {m.quantity_in_stock} / {m.min_stock_level} {m.unit}
                </span>
              </li>
            ))}
            {materials.length > 8 && (
              <li className="text-xs text-muted-foreground pt-1">
                +{materials.length - 8} vật liệu khác...
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
