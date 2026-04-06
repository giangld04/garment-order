'use client';

// User management page — admin only, search, role filter, pagination, CRUD

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserTable from '@/components/users/user-table';
import UserFormModal from '@/components/users/user-form-modal';
import UserDeleteDialog from '@/components/users/user-delete-dialog';
import PaginationControls from '@/components/shared/pagination-controls';
import { userService } from '@/lib/services/user-service';
import { getUser } from '@/lib/auth-utils';
import type { User } from '@/types/user';

const PAGE_SIZE = 20;

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'order_manager', label: 'Quản lý đơn hàng' },
  { value: 'production_manager', label: 'Quản lý sản xuất' },
];

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const currentUser = getUser();

  const fetchData = useCallback(async (pg = page, q = search, role = roleFilter) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
      if (q) params.search = q;
      if (role) params.role = role;
      const res = await userService.list(params);
      setData(res.data.results);
      setTotal(res.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchData(page, search, roleFilter); }, [page, roleFilter]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(1, search, roleFilter); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setFormOpen(true); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý người dùng</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Thêm tài khoản
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Tìm theo tên đăng nhập, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 w-48 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <UserTable
        data={data}
        loading={loading}
        currentUserId={currentUser?.id ?? -1}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <UserFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => fetchData(page, search, roleFilter)}
      />

      <UserDeleteDialog
        user={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => fetchData(page, search, roleFilter)}
      />
    </div>
  );
}
