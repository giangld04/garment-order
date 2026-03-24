'use client';

// Editable table of order line items (product, quantity, unit_price, subtotal)

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { formatVND } from '@/lib/format-utils';
import type { Product } from '@/types/product';
import type { OrderDetail } from '@/types/order';

interface OrderDetailsEditorProps {
  details: OrderDetail[];
  products: Product[];
  onChange: (details: OrderDetail[]) => void;
}

const EMPTY_ROW: OrderDetail = { product: 0, quantity: 1, unit_price: 0, notes: '' };

export default function OrderDetailsEditor({ details, products, onChange }: OrderDetailsEditorProps) {
  const updateRow = (index: number, patch: Partial<OrderDetail>) => {
    const updated = details.map((row, i) => {
      if (i !== index) return row;
      const next = { ...row, ...patch };
      // Auto-fill unit_price when product changes
      if (patch.product !== undefined) {
        const found = products.find((p) => p.id === Number(patch.product));
        if (found) next.unit_price = found.unit_price;
      }
      return next;
    });
    onChange(updated);
  };

  const addRow = () => onChange([...details, { ...EMPTY_ROW }]);

  const removeRow = (index: number) => onChange(details.filter((_, i) => i !== index));

  const total = details.reduce((sum, d) => sum + d.quantity * d.unit_price, 0);

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="w-24">Số lượng</TableHead>
            <TableHead className="w-36">Đơn giá (VND)</TableHead>
            <TableHead className="w-36">Thành tiền</TableHead>
            <TableHead className="w-24">Ghi chú</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <select
                  value={row.product}
                  onChange={(e) => updateRow(i, { product: Number(e.target.value) })}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value={0}>-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="number" min={1} value={row.quantity}
                  onChange={(e) => updateRow(i, { quantity: Number(e.target.value) })}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number" min={0} value={row.unit_price}
                  onChange={(e) => updateRow(i, { unit_price: Number(e.target.value) })}
                  className="w-32"
                />
              </TableCell>
              <TableCell className="text-sm">{formatVND(row.quantity * row.unit_price)}</TableCell>
              <TableCell>
                <Input
                  value={row.notes}
                  onChange={(e) => updateRow(i, { notes: e.target.value })}
                  placeholder="Ghi chú"
                />
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => removeRow(i)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="size-4 mr-1" /> Thêm dòng
        </Button>
        <p className="text-sm font-semibold">
          Tổng cộng: <span className="text-primary">{formatVND(total)}</span>
        </p>
      </div>
    </div>
  );
}
