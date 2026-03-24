'use client';

// Order list table with status badge and action buttons

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatVND, formatDate, getOrderStatusVariant } from '@/lib/format-utils';
import { ORDER_STATUS_LABELS } from '@/types/order';
import type { Order } from '@/types/order';

interface OrderTableProps {
  data: Order[];
  loading: boolean;
  onDelete: (order: Order) => void;
}

export default function OrderTable({ data, loading, onDelete }: OrderTableProps) {
  const router = useRouter();

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
          <TableHead>Mã ĐH</TableHead>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Ngày đặt</TableHead>
          <TableHead>Ngày giao</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Tổng tiền</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
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
          data.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <TableCell className="font-mono text-xs">#{order.id}</TableCell>
              <TableCell className="font-medium">{order.customer_name ?? `#${order.customer}`}</TableCell>
              <TableCell>{formatDate(order.order_date)}</TableCell>
              <TableCell>{formatDate(order.delivery_date)}</TableCell>
              <TableCell>
                <Badge variant={getOrderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </TableCell>
              <TableCell>{formatVND(order.total_amount)}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/orders/${order.id}`)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/orders/${order.id}/edit`)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(order)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
