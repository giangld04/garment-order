'use client';

// Product list page — search, category filter, pagination, CRUD via modals

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductTable from '@/components/products/product-table';
import ProductFormModal from '@/components/products/product-form-modal';
import ProductDeleteDialog from '@/components/products/product-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { productService } from '@/lib/services/product-service';
import { CATEGORY_LABELS } from '@/types/product';
import type { Product, ProductCategory } from '@/types/product';

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const fetchData = useCallback(async (pg = page, q = search, cat = category) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
      if (q) params.search = q;
      if (cat) params.category = cat;
      const res = await productService.list(params);
      setData(res.data.results);
      setTotal(res.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchData(page, search, category); }, [page, category]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(1, search, category); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setFormOpen(true); };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sản phẩm</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Thêm sản phẩm
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search className="size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as ProductCategory | ''); setPage(1); }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <ProductTable
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ProductFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => fetchData(page, search, category)}
      />

      <ProductDeleteDialog
        product={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page, search, category)}
      />
    </div>
  );
}
