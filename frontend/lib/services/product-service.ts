// Product API service — wraps apiClient calls for CRUD operations

import apiClient from '@/lib/api-client';
import type { Product, ProductFormData } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export const productService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Product>>('/products/', { params }),

  get: (id: number) =>
    apiClient.get<Product>(`/products/${id}/`),

  create: (data: ProductFormData) =>
    apiClient.post<Product>('/products/', data),

  update: (id: number, data: Partial<ProductFormData>) =>
    apiClient.put<Product>(`/products/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/products/${id}/`),
};
