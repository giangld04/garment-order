'use client';

// Modal dialog for creating/editing a product

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { productService } from '@/lib/services/product-service';
import { CATEGORY_LABELS } from '@/types/product';
import type { Product, ProductFormData, ProductCategory } from '@/types/product';

interface ProductFormModalProps {
  open: boolean;
  editing: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: ProductFormData = {
  name: '', code: '', category: 'ao', description: '',
  unit_price: 0, image: null, is_active: true,
};

export default function ProductFormModal({ open, editing, onClose, onSaved }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? {
      name: editing.name, code: editing.code, category: editing.category,
      description: editing.description, unit_price: editing.unit_price,
      image: editing.image, is_active: editing.is_active,
    } : EMPTY);
  }, [editing, open]);

  const set = (field: keyof ProductFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Tên và mã sản phẩm là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await productService.update(editing.id, form);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.create(form);
        toast.success('Thêm sản phẩm thành công');
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
          <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="p-name">Tên sản phẩm *</Label>
              <Input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-code">Mã sản phẩm *</Label>
              <Input id="p-code" value={form.code} onChange={(e) => set('code', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-cat">Danh mục</Label>
            <select
              id="p-cat"
              value={form.category}
              onChange={(e) => set('category', e.target.value as ProductCategory)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-price">Giá (VND) *</Label>
            <Input
              id="p-price" type="number" min={0}
              value={form.unit_price}
              onChange={(e) => set('unit_price', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-desc">Mô tả</Label>
            <Input id="p-desc" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="p-active" type="checkbox" checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="size-4"
            />
            <Label htmlFor="p-active">Đang bán</Label>
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
