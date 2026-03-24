'use client';

// Modal dialog for creating/editing a customer

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { customerService } from '@/lib/services/customer-service';
import type { Customer, CustomerFormData } from '@/types/customer';

interface CustomerFormModalProps {
  open: boolean;
  editing: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: CustomerFormData = { name: '', phone: '', email: '', address: '', company_name: '' };

export default function CustomerFormModal({ open, editing, onClose, onSaved }: CustomerFormModalProps) {
  const [form, setForm] = useState<CustomerFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? {
      name: editing.name,
      phone: editing.phone,
      email: editing.email,
      address: editing.address,
      company_name: editing.company_name,
    } : EMPTY);
  }, [editing, open]);

  const handleChange = (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Tên khách hàng là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await customerService.update(editing.id, form);
        toast.success('Cập nhật khách hàng thành công');
      } else {
        await customerService.create(form);
        toast.success('Thêm khách hàng thành công');
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
          <DialogTitle>{editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Tên khách hàng *</Label>
            <Input id="name" value={form.name} onChange={handleChange('name')} placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" value={form.phone} onChange={handleChange('phone')} placeholder="0901234567" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={handleChange('email')} placeholder="email@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" value={form.address} onChange={handleChange('address')} placeholder="123 Đường ABC, TP.HCM" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="company_name">Tên công ty</Label>
            <Input id="company_name" value={form.company_name} onChange={handleChange('company_name')} placeholder="Công ty TNHH ABC" />
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
