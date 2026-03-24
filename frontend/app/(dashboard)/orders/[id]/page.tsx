'use client';

// Order detail page — shows order info, line items, production progress

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import OrderDetailView from '@/components/orders/order-detail-view';
import { orderService } from '@/lib/services/order-service';
import { productionService } from '@/lib/services/production-service';
import type { Order } from '@/types/order';
import type { ProductionProgress } from '@/types/production';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [production, setProduction] = useState<ProductionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      orderService.get(id),
      productionService.list({ order: id }),
    ]).then(([orderRes, prodRes]) => {
      setOrder(orderRes.data);
      setProduction(prodRes.data.results);
    }).catch(() => {
      toast.error('Không thể tải đơn hàng');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-bold">Đơn hàng #{order.id}</h1>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => router.push(`/orders/${order.id}/edit`)}>
            <Pencil className="size-4 mr-1" /> Sửa
          </Button>
        </div>
      </div>

      <OrderDetailView order={order} production={production} />
    </div>
  );
}
