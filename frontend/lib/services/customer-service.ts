// Customer API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { Customer, CustomerFormData } from '@/types/customer';
import type { PaginatedResponse } from '@/types/api';

export const customerService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers/', { params }),

  get: (id: number) =>
    apiClient.get<Customer>(`/customers/${id}/`),

  create: (data: CustomerFormData) =>
    apiClient.post<Customer>('/customers/', data),

  update: (id: number, data: Partial<CustomerFormData>) =>
    apiClient.put<Customer>(`/customers/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/customers/${id}/`),
};
