// Notification and activity log API service

import apiClient from '@/lib/api-client';
import type { Notification, ActivityLog } from '@/types/notification';
import type { PaginatedResponse } from '@/types/api';

export const notificationService = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications/notifications/', { params }),

  unreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/notifications/unread_count/'),

  markRead: (id: number) =>
    apiClient.post<{ status: string }>(`/notifications/notifications/${id}/mark_read/`),

  markAllRead: () =>
    apiClient.post<{ status: string }>('/notifications/notifications/mark_all_read/'),

  listActivityLogs: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<ActivityLog>>('/notifications/activity-logs/', { params }),
};
