'use client';

// Confirmation dialog for deleting a material

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { materialService } from '@/lib/services/material-service';
import type { Material } from '@/types/material';

interface MaterialDeleteDialogProps {
  material: Material | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function MaterialDeleteDialog({ material, onClose, onDeleted }: MaterialDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!material) return;
    setDeleting(true);
    try {
      await materialService.delete(material.id);
      toast.success('Xóa vật liệu thành công');
      onDeleted();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!material} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa vật liệu</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa vật liệu <strong>{material?.name}</strong>? Hành động này không thể hoàn tác.
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
