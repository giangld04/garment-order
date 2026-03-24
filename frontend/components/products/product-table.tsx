'use client';

// Product data table with edit/delete actions

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatVND, formatDate } from '@/lib/format-utils';
import { CATEGORY_LABELS } from '@/types/product';
import type { Product } from '@/types/product';

interface ProductTableProps {
  data: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ data, loading, onEdit, onDelete }: ProductTableProps) {
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
          <TableHead>Mã SP</TableHead>
          <TableHead>Tên sản phẩm</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Ngày tạo</TableHead>
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
          data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.code}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{CATEGORY_LABELS[product.category] ?? product.category}</TableCell>
              <TableCell>{formatVND(product.unit_price)}</TableCell>
              <TableCell>
                <Badge variant={product.is_active ? 'default' : 'outline'}>
                  {product.is_active ? 'Đang bán' : 'Ngừng bán'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(product.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(product)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(product)}>
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
