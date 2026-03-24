'use client';

// Order create page

import OrderForm from '@/components/orders/order-form';

export default function OrderCreatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tạo đơn hàng mới</h1>
      <OrderForm />
    </div>
  );
}
