'use client';

// Confirmation dialog for deleting an order

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { orderService } from '@/lib/services/order-service';
import type { Order } from '@/types/order';

interface OrderDeleteDialogProps {
  order: Order | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function OrderDeleteDialog({ order, onClose, onDeleted }: OrderDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      await orderService.delete(order.id);
      toast.success('Xóa đơn hàng thành công');
      onDeleted();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa đơn hàng</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa đơn hàng <strong>#{order?.id}</strong>? Hành động này không thể hoàn tác.
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
