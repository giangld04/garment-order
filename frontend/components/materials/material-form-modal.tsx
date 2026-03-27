'use client';

// Modal dialog for creating/editing a material record

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { materialService } from '@/lib/services/material-service';
import { supplierService } from '@/lib/services/supplier-service';
import type { Material, MaterialFormData } from '@/types/material';
import type { Supplier } from '@/types/supplier';

interface MaterialFormModalProps {
  open: boolean;
  editing: Material | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: MaterialFormData = {
  code: '', name: '', unit: '',
  quantity_in_stock: 0, min_stock_level: 0,
  unit_price: 0, supplier: null, notes: '',
};

export default function MaterialFormModal({ open, editing, onClose, onSaved }: MaterialFormModalProps) {
  const [form, setForm] = useState<MaterialFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load suppliers once on mount
  useEffect(() => {
    supplierService.list({ page_size: 200 }).then((res) => {
      setSuppliers(res.data.results);
    }).catch(() => {});
  }, []);

  // Sync form when editing changes
  useEffect(() => {
    setForm(editing ? {
      code: editing.code,
      name: editing.name,
      unit: editing.unit,
      quantity_in_stock: editing.quantity_in_stock,
      min_stock_level: editing.min_stock_level,
      unit_price: editing.unit_price,
      supplier: editing.supplier,
      notes: editing.notes,
    } : EMPTY);
  }, [editing, open]);

  const set = (field: keyof MaterialFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setNum = (field: keyof MaterialFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: Number(e.target.value) || 0 }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Mã và tên vật liệu là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await materialService.update(editing.id, form);
        toast.success('Cập nhật vật liệu thành công');
      } else {
        await materialService.create(form);
        toast.success('Thêm vật liệu thành công');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa vật liệu' : 'Thêm vật liệu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code">Mã vật liệu *</Label>
              <Input id="code" value={form.code} onChange={set('code')} placeholder="VL001" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit">Đơn vị *</Label>
              <Input id="unit" value={form.unit} onChange={set('unit')} placeholder="m, kg, cuộn..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Tên vật liệu *</Label>
            <Input id="name" value={form.name} onChange={set('name')} placeholder="Vải cotton trắng" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="quantity_in_stock">Tồn kho</Label>
              <Input id="quantity_in_stock" type="number" min="0" step="0.01"
                value={form.quantity_in_stock} onChange={setNum('quantity_in_stock')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="min_stock_level">Tồn tối thiểu</Label>
              <Input id="min_stock_level" type="number" min="0" step="0.01"
                value={form.min_stock_level} onChange={setNum('min_stock_level')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit_price">Đơn giá (₫)</Label>
              <Input id="unit_price" type="number" min="0"
                value={form.unit_price} onChange={setNum('unit_price')} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="supplier">Nhà cung cấp</Label>
            <select
              id="supplier"
              value={form.supplier ?? ''}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                supplier: e.target.value ? Number(e.target.value) : null,
              }))}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">— Không có —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" value={form.notes} onChange={set('notes')} placeholder="Ghi chú..." />
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
