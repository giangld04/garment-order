// Order domain types

export type OrderStatus = 'pending' | 'confirmed' | 'producing' | 'completed' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  producing: 'Đang sản xuất',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export interface OrderDetail {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  notes: string;
}

export interface Order {
  id: number;
  customer: number;
  customer_name?: string;
  created_by?: number;
  created_by_name?: string;
  order_date: string;
  delivery_date: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string;
  details: OrderDetail[];
  created_at: string;
}

export type OrderFormData = Omit<Order, 'id' | 'created_at' | 'created_by' | 'created_by_name' | 'customer_name' | 'total_amount'>;
