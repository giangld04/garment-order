// Product domain types

export type ProductCategory = 'ao' | 'quan' | 'vay' | 'do_bo' | 'khac';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ao: 'Áo',
  quan: 'Quần',
  vay: 'Váy',
  do_bo: 'Đồ bộ',
  khac: 'Khác',
};

export interface Product {
  id: number;
  name: string;
  code: string;
  category: ProductCategory;
  description: string;
  unit_price: number;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at'>;
