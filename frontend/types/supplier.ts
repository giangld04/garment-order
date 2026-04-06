// Supplier domain types

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_code: string;
  notes: string;
  created_at: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'created_at'>;
