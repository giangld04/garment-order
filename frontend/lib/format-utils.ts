// Utility functions for number/currency/date formatting used across dashboard and reports

import type { OrderStatus } from '@/types/order';
import type { ProductionStatus } from '@/types/production';

/**
 * Format a number as Vietnamese Dong (VND) currency.
 * e.g. 1500000 → "1.500.000 ₫"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Alias for formatCurrency — used by order/product components.
 */
export const formatVND = formatCurrency;

/**
 * Format a number with Vietnamese locale separators.
 * e.g. 1500 → "1.500"
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Abbreviate large VND amounts for chart Y-axis labels.
 * e.g. 1500000 → "1,5M", 10000000 → "10M"
 */
export const formatCurrencyAbbr = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}T`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
};

/**
 * Convert an ISO date string or "YYYY-MM" to a short Vietnamese month label.
 * e.g. "2025-03" → "T3/2025"
 */
export const formatMonth = (dateStr: string): string => {
  // Support both "YYYY-MM" and "YYYY-MM-DD"
  const [year, month] = dateStr.split('-');
  return `T${parseInt(month)}/${year}`;
};

/**
 * Format an ISO date string as a readable Vietnamese date.
 * e.g. "2025-03-24T10:00:00Z" → "24/03/2025"
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Map an order status to a shadcn Badge variant for visual distinction.
 * Returns one of: 'default' | 'secondary' | 'destructive' | 'outline'
 */
export const getOrderStatusVariant = (
  status: OrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const map: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending:   'outline',
    confirmed: 'secondary',
    producing: 'default',
    completed: 'default',
    cancelled: 'destructive',
  };
  return map[status] ?? 'outline';
};

/**
 * Map a production status to a shadcn Badge variant.
 */
export const getProductionStatusVariant = (
  status: ProductionStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const map: Record<ProductionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    not_started: 'outline',
    in_progress: 'default',
    completed:   'secondary',
  };
  return map[status] ?? 'outline';
};
