'use client';

// Supplier list page — search, pagination, CRUD via modals

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierTable from '@/components/suppliers/supplier-table';
import SupplierFormModal from '@/components/suppliers/supplier-form-modal';
import SupplierDeleteDialog from '@/components/suppliers/supplier-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { supplierService } from '@/lib/services/supplier-service';
import type { Supplier } from '@/types/supplier';

const PAGE_SIZE = 20;

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const fetchData = useCallback(async (pg = page, q = search) => {
    setLoading(true);
    try {
      const res = await supplierService.list({ page: pg, search: q, page_size: PAGE_SIZE });
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
  const openEdit = (s: Supplier) => { setEditing(s); setFormOpen(true); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Nhà cung cấp</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Thêm nhà cung cấp
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, người liên hệ, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <SupplierTable
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <SupplierFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => fetchData(page, search)}
      />

      <SupplierDeleteDialog
        supplier={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page, search)}
      />
    </div>
  );
}
