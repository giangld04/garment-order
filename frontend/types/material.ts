// Material and MaterialUsage domain types

export interface Material {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity_in_stock: number;
  min_stock_level: number;
  unit_price: number;
  supplier: number | null;
  supplier_name: string;
  notes: string;
  created_at: string;
}

export type MaterialFormData = Omit<Material, 'id' | 'created_at' | 'supplier_name'>;

export interface MaterialUsage {
  id: number;
  order: number;
  material: number;
  material_name: string;
  quantity_used: number;
  notes: string;
  created_at: string;
}
