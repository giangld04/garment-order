// User management API service — admin-only CRUD for user accounts

import apiClient from '@/lib/api-client';
import type { User } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: User['role'];
  phone: string;
  is_active: boolean;
  password?: string;
}

export const userService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<User>>('/auth/users/', { params }),

  get: (id: number) =>
    apiClient.get<User>(`/auth/users/${id}/`),

  create: (data: UserFormData) =>
    apiClient.post<User>('/auth/users/', data),

  update: (id: number, data: Partial<UserFormData>) =>
    apiClient.put<User>(`/auth/users/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/auth/users/${id}/`),
};
