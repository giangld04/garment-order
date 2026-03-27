'use client';

// Supplier data table with edit/delete actions

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format-utils';
import type { Supplier } from '@/types/supplier';

interface SupplierTableProps {
  data: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export default function SupplierTable({ data, loading, onEdit, onDelete }: SupplierTableProps) {
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
          <TableHead>Tên nhà cung cấp</TableHead>
          <TableHead>Người liên hệ</TableHead>
          <TableHead>Số điện thoại</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mã số thuế</TableHead>
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
          data.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contact_person || '—'}</TableCell>
              <TableCell>{supplier.phone || '—'}</TableCell>
              <TableCell>{supplier.email || '—'}</TableCell>
              <TableCell>{supplier.tax_code || '—'}</TableCell>
              <TableCell>{formatDate(supplier.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(supplier)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(supplier)}>
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
