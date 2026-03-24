// Order API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { Order, OrderFormData, OrderStatus } from '@/types/order';
import type { PaginatedResponse } from '@/types/api';

export const orderService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Order>>('/orders/', { params }),

  get: (id: number) =>
    apiClient.get<Order>(`/orders/${id}/`),

  create: (data: OrderFormData) =>
    apiClient.post<Order>('/orders/', data),

  update: (id: number, data: Partial<OrderFormData>) =>
    apiClient.put<Order>(`/orders/${id}/`, data),

  updateStatus: (id: number, status: OrderStatus) =>
    apiClient.patch<Order>(`/orders/${id}/`, { status }),

  delete: (id: number) =>
    apiClient.delete(`/orders/${id}/`),
};
