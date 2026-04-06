// Material API service — CRUD + low-stock action

import apiClient from '@/lib/api-client';
import type { Material, MaterialFormData, MaterialUsage } from '@/types/material';
import type { PaginatedResponse } from '@/types/api';

export const materialService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Material>>('/materials/materials/', { params }),

  get: (id: number) =>
    apiClient.get<Material>(`/materials/materials/${id}/`),

  create: (data: MaterialFormData) =>
    apiClient.post<Material>('/materials/materials/', data),

  update: (id: number, data: Partial<MaterialFormData>) =>
    apiClient.put<Material>(`/materials/materials/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/materials/materials/${id}/`),

  lowStock: () =>
    apiClient.get<Material[]>('/materials/materials/low_stock/'),

  listUsages: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<MaterialUsage>>('/materials/material-usages/', { params }),
};
