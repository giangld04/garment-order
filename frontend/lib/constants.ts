// Application constants: menu items with routes and role access

import type { User } from '@/types/user';

export type UserRole = User['role'];

export interface MenuItem {
  key: string;
  labelVi: string;
  labelEn: string;
  href: string;
  icon: string; // lucide icon name
  roles: UserRole[] | null; // null = visible to all
}

// Navigation menu configuration
// roles: null means visible to all authenticated users
export const MENU_ITEMS: MenuItem[] = [
  {
    key: 'dashboard',
    labelVi: 'Trang chủ',
    labelEn: 'Dashboard',
    href: '/',
    icon: 'LayoutDashboard',
    roles: null,
  },
  {
    key: 'customers',
    labelVi: 'Khách hàng',
    labelEn: 'Customers',
    href: '/customers',
    icon: 'Users',
    roles: ['admin', 'order_manager'],
  },
  {
    key: 'products',
    labelVi: 'Sản phẩm',
    labelEn: 'Products',
    href: '/products',
    icon: 'Package',
    roles: ['admin', 'order_manager'],
  },
  {
    key: 'orders',
    labelVi: 'Đơn hàng',
    labelEn: 'Orders',
    href: '/orders',
    icon: 'ShoppingCart',
    roles: ['admin', 'order_manager'],
  },
  {
    key: 'production',
    labelVi: 'Tiến độ sản xuất',
    labelEn: 'Production',
    href: '/production',
    icon: 'Factory',
    roles: ['admin', 'production_manager'],
  },
  {
    key: 'statistics',
    labelVi: 'Thống kê',
    labelEn: 'Statistics',
    href: '/statistics',
    icon: 'BarChart2',
    roles: ['admin'],
  },
  {
    key: 'reports',
    labelVi: 'Báo cáo',
    labelEn: 'Reports',
    href: '/reports',
    icon: 'FileText',
    roles: ['admin'],
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  order_manager: 'Quản lý đơn hàng',
  production_manager: 'Quản lý sản xuất',
};
