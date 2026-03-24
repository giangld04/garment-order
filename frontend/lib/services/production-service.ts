// Production progress API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { ProductionProgress, ProductionStatus } from '@/types/production';
import type { PaginatedResponse } from '@/types/api';

export const productionService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<ProductionProgress>>('/production/', { params }),

  get: (id: number) =>
    apiClient.get<ProductionProgress>(`/production/${id}/`),

  update: (id: number, data: Partial<ProductionProgress>) =>
    apiClient.put<ProductionProgress>(`/production/${id}/`, data),

  updateStatus: (id: number, status: ProductionStatus) =>
    apiClient.patch<ProductionProgress>(`/production/${id}/`, { status }),

  createForOrder: (orderId: number) =>
    apiClient.post('/production/create_for_order/', { order: orderId }),
};
