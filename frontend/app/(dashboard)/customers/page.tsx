'use client';

// Customer list page — search, pagination, CRUD via modals

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerTable from '@/components/customers/customer-table';
import CustomerFormModal from '@/components/customers/customer-form-modal';
import CustomerDeleteDialog from '@/components/customers/customer-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { customerService } from '@/lib/services/customer-service';
import type { Customer } from '@/types/customer';

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const fetchData = useCallback(async (pg = page, q = search) => {
    setLoading(true);
    try {
      const res = await customerService.list({ page: pg, search: q, page_size: PAGE_SIZE });
      setData(res.data.results);
      setTotal(res.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(page, search); }, [page]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setFormOpen(true); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Khách hàng</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Thêm khách hàng
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CustomerTable
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <CustomerFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => fetchData(page, search)}
      />

      <CustomerDeleteDialog
        customer={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page, search)}
      />
    </div>
  );
}
