'use client';

// Full-page order create/edit form with nested order details

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import OrderDetailsEditor from './order-details-editor';
import { orderService } from '@/lib/services/order-service';
import { customerService } from '@/lib/services/customer-service';
import { productService } from '@/lib/services/product-service';
import type { Order, OrderFormData, OrderDetail } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';

interface OrderFormProps {
  editing?: Order;
}

const EMPTY_FORM: OrderFormData = {
  customer: 0,
  order_date: new Date().toISOString().split('T')[0],
  delivery_date: null,
  status: 'pending',
  notes: '',
  details: [],
};

export default function OrderForm({ editing }: OrderFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<OrderFormData>(EMPTY_FORM);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load customers and products for select fields
    Promise.all([
      customerService.list({ page: 1 }),
      productService.list({ page: 1, is_active: 1 }),
    ]).then(([cRes, pRes]) => {
      setCustomers(cRes.data.results);
      setProducts(pRes.data.results);
    }).catch(() => toast.error('Không thể tải dữ liệu'));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        customer: editing.customer,
        order_date: editing.order_date,
        delivery_date: editing.delivery_date,
        status: editing.status,
        notes: editing.notes,
        details: editing.details,
      });
    }
  }, [editing]);

  const set = (field: keyof OrderFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    const invalidRows = form.details.filter((d) => !d.product || d.quantity < 1);
    if (invalidRows.length > 0) {
      toast.error('Vui lòng chọn sản phẩm và số lượng hợp lệ cho tất cả dòng');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await orderService.update(editing.id, form);
        toast.success('Cập nhật đơn hàng thành công');
        router.push(`/orders/${editing.id}`);
      } else {
        const res = await orderService.create(form);
        toast.success('Tạo đơn hàng thành công');
        router.push(`/orders/${res.data.id}`);
      }
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Thông tin đơn hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="o-customer">Khách hàng *</Label>
            <select
              id="o-customer"
              value={form.customer}
              onChange={(e) => set('customer', Number(e.target.value))}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value={0}>-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-status">Trạng thái</Label>
            <select
              id="o-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="producing">Đang sản xuất</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-date">Ngày đặt hàng *</Label>
            <Input
              id="o-date" type="date" value={form.order_date}
              onChange={(e) => set('order_date', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-delivery">Ngày giao hàng</Label>
            <Input
              id="o-delivery" type="date" value={form.delivery_date ?? ''}
              onChange={(e) => set('delivery_date', e.target.value || null)}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="o-notes">Ghi chú</Label>
            <Input
              id="o-notes" value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Ghi chú thêm..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Chi tiết đơn hàng</h2>
        <OrderDetailsEditor
          details={form.details as OrderDetail[]}
          products={products}
          onChange={(details) => set('details', details)}
        />
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu đơn hàng'}</Button>
      </div>
    </form>
  );
}
