// Production progress API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { ProductionProgress, ProductionStatus } from '@/types/production';
import type { PaginatedResponse } from '@/types/api';

export const productionService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<ProductionProgress>>('/orders/production-progress/', { params }),

  get: (id: number) =>
    apiClient.get<ProductionProgress>(`/orders/production-progress/${id}/`),

  update: (id: number, data: Partial<ProductionProgress>) =>
    apiClient.put<ProductionProgress>(`/orders/production-progress/${id}/`, data),

  updateStatus: (id: number, status: ProductionStatus) =>
    apiClient.patch<ProductionProgress>(`/orders/production-progress/${id}/`, { status }),

  createForOrder: (orderId: number) =>
    apiClient.post('/orders/production-progress/create_for_order/', { order: orderId }),
};
