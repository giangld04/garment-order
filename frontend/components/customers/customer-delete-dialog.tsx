'use client';

// Confirmation dialog for deleting a customer

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { customerService } from '@/lib/services/customer-service';
import type { Customer } from '@/types/customer';

interface CustomerDeleteDialogProps {
  customer: Customer | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function CustomerDeleteDialog({ customer, onClose, onDeleted }: CustomerDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!customer) return;
    setDeleting(true);
    try {
      await customerService.delete(customer.id);
      toast.success('Xóa khách hàng thành công');
      onDeleted();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa khách hàng</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa khách hàng <strong>{customer?.name}</strong>? Hành động này không thể hoàn tác.
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
