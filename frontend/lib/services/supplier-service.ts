// Supplier API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { Supplier, SupplierFormData } from '@/types/supplier';
import type { PaginatedResponse } from '@/types/api';

export const supplierService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Supplier>>('/suppliers/', { params }),

  get: (id: number) =>
    apiClient.get<Supplier>(`/suppliers/${id}/`),

  create: (data: SupplierFormData) =>
    apiClient.post<Supplier>('/suppliers/', data),

  update: (id: number, data: Partial<SupplierFormData>) =>
    apiClient.put<Supplier>(`/suppliers/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/suppliers/${id}/`),
};
