'use client';

// Modal dialog for creating or editing a user account
// Password field is required on create, optional on edit

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { userService, type UserFormData } from '@/lib/services/user-service';
import type { User } from '@/types/user';

interface UserFormModalProps {
  open: boolean;
  editing: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: UserFormData = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'order_manager',
  phone: '',
  is_active: true,
  password: '',
};

const ROLE_OPTIONS: { value: User['role']; label: string }[] = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'order_manager', label: 'Quản lý đơn hàng' },
  { value: 'production_manager', label: 'Quản lý sản xuất' },
];

const SELECT_CLASS = 'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm';

export default function UserFormModal({ open, editing, onClose, onSaved }: UserFormModalProps) {
  const [form, setForm] = useState<UserFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        username: editing.username,
        email: editing.email,
        first_name: editing.first_name,
        last_name: editing.last_name,
        role: editing.role,
        phone: editing.phone,
        is_active: editing.is_active,
        password: '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  const set = (field: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error('Tên đăng nhập là bắt buộc');
      return;
    }
    if (!editing && !form.password) {
      toast.error('Mật khẩu là bắt buộc khi tạo tài khoản');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      // Don't send empty password on edit
      if (editing && !payload.password) {
        delete payload.password;
      }
      if (editing) {
        await userService.update(editing.id, payload);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await userService.create(payload);
        toast.success('Tạo tài khoản thành công');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa tài khoản' : 'Thêm tài khoản'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="username">Tên đăng nhập *</Label>
            <Input
              id="username"
              value={form.username}
              onChange={set('username')}
              placeholder="admin"
              disabled={!!editing}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="first_name">Họ</Label>
              <Input id="first_name" value={form.first_name} onChange={set('first_name')} placeholder="Nguyễn" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_name">Tên</Label>
              <Input id="last_name" value={form.last_name} onChange={set('last_name')} placeholder="Văn A" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="user@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" value={form.phone} onChange={set('phone')} placeholder="0901234567" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Vai trò</Label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as User['role'] }))}
              className={SELECT_CLASS}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">
              {editing ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password ?? ''}
              onChange={set('password')}
              placeholder="••••••"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="size-4"
            />
            <Label htmlFor="is_active">Kích hoạt tài khoản</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
