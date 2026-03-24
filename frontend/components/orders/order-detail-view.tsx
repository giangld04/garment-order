'use client';

// Read-only order detail view showing order info, line items, and production stages

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { formatVND, formatDate, getOrderStatusVariant, getProductionStatusVariant } from '@/lib/format-utils';
import { ORDER_STATUS_LABELS } from '@/types/order';
import { STAGE_LABELS, STATUS_LABELS } from '@/types/production';
import type { Order } from '@/types/order';
import type { ProductionProgress } from '@/types/production';

interface OrderDetailViewProps {
  order: Order;
  production: ProductionProgress[];
}

export default function OrderDetailView({ order, production }: OrderDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Order summary */}
      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Khách hàng</p>
          <p className="font-medium">{order.customer_name ?? `#${order.customer}`}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Ngày đặt</p>
          <p>{formatDate(order.order_date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Ngày giao</p>
          <p>{formatDate(order.delivery_date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Trạng thái</p>
          <Badge variant={getOrderStatusVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">Ghi chú</p>
          <p>{order.notes || '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">Tổng tiền</p>
          <p className="font-semibold text-primary">{formatVND(order.total_amount)}</p>
        </div>
      </Card>

      {/* Order details */}
      <div>
        <h3 className="font-semibold mb-2">Chi tiết đơn hàng</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead>Thành tiền</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.details.map((d, i) => (
              <TableRow key={d.id ?? i}>
                <TableCell>{d.product_name ?? `#${d.product}`}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{formatVND(d.unit_price)}</TableCell>
                <TableCell>{formatVND(d.quantity * d.unit_price)}</TableCell>
                <TableCell>{d.notes || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Production progress */}
      {production.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Tiến độ sản xuất</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Công đoạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Người phụ trách</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {production.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{STAGE_LABELS[p.stage]}</TableCell>
                  <TableCell>
                    <Badge variant={getProductionStatusVariant(p.status)}>
                      {STATUS_LABELS[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(p.start_date)}</TableCell>
                  <TableCell>{formatDate(p.end_date)}</TableCell>
                  <TableCell>{p.assigned_to || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
