'use client';

// Production progress page — filter by stage/status, inline status editing

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductionTable from '@/components/production/production-table';
import PaginationControls from '@/components/shared/pagination-controls';
import { productionService } from '@/lib/services/production-service';
import { STAGE_LABELS, STATUS_LABELS } from '@/types/production';
import type { ProductionProgress, ProductionStage, ProductionStatus } from '@/types/production';

const PAGE_SIZE = 20;

export default function ProductionPage() {
  const [data, setData] = useState<ProductionProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStage, setFilterStage] = useState<ProductionStage | ''>('');
  const [filterStatus, setFilterStatus] = useState<ProductionStatus | ''>('');
  const [filterOrder, setFilterOrder] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
      if (filterStage) params.stage = filterStage;
      if (filterStatus) params.status = filterStatus;
      if (filterOrder) params.order = filterOrder;
      const res = await productionService.list(params);
      setData(res.data.results);
      setTotal(res.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, filterStage, filterStatus, filterOrder]);

  useEffect(() => { fetchData(page); }, [page, filterStage, filterStatus]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(1); }, 400);
    return () => clearTimeout(t);
  }, [filterOrder]);

  const handleStatusChange = async (id: number, status: ProductionStatus) => {
    try {
      await productionService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchData(page);
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tiến độ sản xuất</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Công đoạn</Label>
          <select
            value={filterStage}
            onChange={(e) => { setFilterStage(e.target.value as ProductionStage | ''); setPage(1); }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Tất cả</option>
            {(Object.entries(STAGE_LABELS) as [ProductionStage, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Trạng thái</Label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as ProductionStatus | ''); setPage(1); }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Tất cả</option>
            {(Object.entries(STATUS_LABELS) as [ProductionStatus, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Mã đơn hàng</Label>
          <Input
            placeholder="Tìm theo đơn hàng..."
            value={filterOrder}
            onChange={(e) => setFilterOrder(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <ProductionTable
        data={data}
        loading={loading}
        onStatusChange={handleStatusChange}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
