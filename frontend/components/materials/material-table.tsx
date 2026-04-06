'use client';

// Material data table with stock color coding and edit/delete actions

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format-utils';
import type { Material } from '@/types/material';

interface MaterialTableProps {
  data: Material[];
  loading: boolean;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

function isLowStock(m: Material) {
  return Number(m.quantity_in_stock) < Number(m.min_stock_level);
}

export default function MaterialTable({ data, loading, onEdit, onDelete }: MaterialTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã vật liệu</TableHead>
          <TableHead>Tên vật liệu</TableHead>
          <TableHead>Đơn vị</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead>Tồn tối thiểu</TableHead>
          <TableHead>Đơn giá</TableHead>
          <TableHead>Nhà cung cấp</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          data.map((material) => (
            <TableRow
              key={material.id}
              className={isLowStock(material) ? 'bg-red-50 dark:bg-red-950/20' : undefined}
            >
              <TableCell className="font-mono text-sm">{material.code}</TableCell>
              <TableCell className="font-medium">{material.name}</TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell className={isLowStock(material) ? 'text-red-600 font-semibold' : ''}>
                {material.quantity_in_stock}
              </TableCell>
              <TableCell>{material.min_stock_level}</TableCell>
              <TableCell>{Number(material.unit_price).toLocaleString('vi-VN')} ₫</TableCell>
              <TableCell>{material.supplier_name || '—'}</TableCell>
              <TableCell>{formatDate(material.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(material)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(material)}>
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
