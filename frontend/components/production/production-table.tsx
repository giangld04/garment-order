'use client';

// Production progress table with inline status editing

import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getProductionStatusVariant } from '@/lib/format-utils';
import { STAGE_LABELS, STATUS_LABELS } from '@/types/production';
import type { ProductionProgress, ProductionStatus } from '@/types/production';

interface ProductionTableProps {
  data: ProductionProgress[];
  loading: boolean;
  onStatusChange: (id: number, status: ProductionStatus) => void;
}

const STATUS_OPTIONS: ProductionStatus[] = ['not_started', 'in_progress', 'completed'];

export default function ProductionTable({ data, loading, onStatusChange }: ProductionTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Đơn hàng</TableHead>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Công đoạn</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Ngày bắt đầu</TableHead>
          <TableHead>Ngày kết thúc</TableHead>
          <TableHead>Người phụ trách</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">#{item.order}</TableCell>
              <TableCell>{item.customer_name ?? '—'}</TableCell>
              <TableCell>{STAGE_LABELS[item.stage]}</TableCell>
              <TableCell>
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value as ProductionStatus)}
                  className="h-7 rounded-md border border-input bg-transparent px-2 text-xs"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>{formatDate(item.start_date)}</TableCell>
              <TableCell>{formatDate(item.end_date)}</TableCell>
              <TableCell>{item.assigned_to || '—'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
