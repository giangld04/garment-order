'use client';

// Materials list page — search, pagination, CRUD via modals

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MaterialTable from '@/components/materials/material-table';
import MaterialFormModal from '@/components/materials/material-form-modal';
import MaterialDeleteDialog from '@/components/materials/material-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { materialService } from '@/lib/services/material-service';
import type { Material } from '@/types/material';

const PAGE_SIZE = 20;

export default function MaterialsPage() {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const fetchData = useCallback(async (pg = page, q = search) => {
    setLoading(true);
    try {
      const res = await materialService.list({ page: pg, search: q, page_size: PAGE_SIZE });
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
  const openEdit = (m: Material) => { setEditing(m); setFormOpen(true); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vật liệu / Kho nguyên liệu</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Thêm vật liệu
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã, tên vật liệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <MaterialTable
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <MaterialFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => fetchData(page, search)}
      />

      <MaterialDeleteDialog
        material={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page, search)}
      />
    </div>
  );
}
