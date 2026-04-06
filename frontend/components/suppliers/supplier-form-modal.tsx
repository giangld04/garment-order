'use client';

// Modal dialog for creating/editing a supplier

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { supplierService } from '@/lib/services/supplier-service';
import type { Supplier, SupplierFormData } from '@/types/supplier';

interface SupplierFormModalProps {
  open: boolean;
  editing: Supplier | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: SupplierFormData = {
  name: '', contact_person: '', phone: '', email: '', address: '', tax_code: '', notes: '',
};

export default function SupplierFormModal({ open, editing, onClose, onSaved }: SupplierFormModalProps) {
  const [form, setForm] = useState<SupplierFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? {
      name: editing.name,
      contact_person: editing.contact_person,
      phone: editing.phone,
      email: editing.email,
      address: editing.address,
      tax_code: editing.tax_code,
      notes: editing.notes,
    } : EMPTY);
  }, [editing, open]);

  const handleChange = (field: keyof SupplierFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Tên nhà cung cấp là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await supplierService.update(editing.id, form);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await supplierService.create(form);
        toast.success('Thêm nhà cung cấp thành công');
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
          <DialogTitle>{editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Tên nhà cung cấp *</Label>
            <Input id="name" value={form.name} onChange={handleChange('name')} placeholder="Công ty TNHH ABC" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contact_person">Người liên hệ</Label>
            <Input id="contact_person" value={form.contact_person} onChange={handleChange('contact_person')} placeholder="Nguyễn Văn A" />
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
            <Label htmlFor="tax_code">Mã số thuế</Label>
            <Input id="tax_code" value={form.tax_code} onChange={handleChange('tax_code')} placeholder="0123456789" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" value={form.notes} onChange={handleChange('notes')} placeholder="Ghi chú thêm..." />
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
