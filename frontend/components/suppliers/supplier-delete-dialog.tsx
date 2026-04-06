'use client';

// Confirmation dialog for deleting a supplier

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { supplierService } from '@/lib/services/supplier-service';
import type { Supplier } from '@/types/supplier';

interface SupplierDeleteDialogProps {
  supplier: Supplier | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function SupplierDeleteDialog({ supplier, onClose, onDeleted }: SupplierDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!supplier) return;
    setDeleting(true);
    try {
      await supplierService.delete(supplier.id);
      toast.success('Xóa nhà cung cấp thành công');
      onDeleted();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!supplier} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa nhà cung cấp</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa nhà cung cấp <strong>{supplier?.name}</strong>? Hành động này không thể hoàn tác.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
