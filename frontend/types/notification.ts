// Notification and activity log types matching backend models

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  type: 'order_status' | 'production_update' | 'low_stock' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user: number | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  details: Record<string, unknown>;
  created_at: string;
}
