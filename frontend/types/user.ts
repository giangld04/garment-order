// User domain types used across the application

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'order_manager' | 'production_manager';
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
