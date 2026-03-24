// Customer domain types

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  company_name: string;
  created_at: string;
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at'>;
