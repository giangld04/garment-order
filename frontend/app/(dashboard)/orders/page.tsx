'use client';

// Order list page — status filter, date range filter, pagination

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrderTable from '@/components/orders/order-table';
import OrderDeleteDialog from '@/components/orders/order-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { orderService } from '@/lib/services/order-service';
import { ORDER_STATUS_LABELS } from '@/types/order';
import type { Order, OrderStatus } from '@/types/order';

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<Order | null>(null);

  const fetchData = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
      if (status) params.status = status;
      if (dateFrom) params.order_date_after = dateFrom;
      if (dateTo) params.order_date_before = dateTo;
      const res = await orderService.list(params);
      setData(res.data.results);
      setTotal(res.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, status, dateFrom, dateTo]);

  useEffect(() => { fetchData(page); }, [page, status, dateFrom, dateTo]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Đơn hàng</h1>
        <Button onClick={() => router.push('/orders/create')}>
          <Plus className="size-4 mr-1" /> Tạo đơn hàng
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Từ:</span>
          <Input
            type="date" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-36"
          />
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Đến:</span>
          <Input
            type="date" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-36"
          />
        </div>
      </div>

      <OrderTable data={data} loading={loading} onDelete={setDeleting} />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <OrderDeleteDialog
        order={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page)}
      />
    </div>
  );
}
