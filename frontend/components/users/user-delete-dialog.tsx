'use client';

// Confirmation dialog for deleting a user account

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { userService } from '@/lib/services/user-service';
import type { User } from '@/types/user';

interface UserDeleteDialogProps {
  user: User | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function UserDeleteDialog({ user, onClose, onDeleted }: UserDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await userService.delete(user.id);
      toast.success('Xóa tài khoản thành công');
      onDeleted();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa tài khoản</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa tài khoản <strong>{user?.username}</strong>? Hành động này không thể hoàn tác.
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
