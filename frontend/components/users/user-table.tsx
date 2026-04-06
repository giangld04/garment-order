'use client';

// User data table with role badge, active status, and edit/delete actions

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format-utils';
import { ROLE_LABELS } from '@/lib/constants';
import type { User } from '@/types/user';

interface UserTableProps {
  data: User[];
  loading: boolean;
  currentUserId: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ROLE_VARIANTS: Record<User['role'], 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  order_manager: 'secondary',
  production_manager: 'outline',
};

export default function UserTable({ data, loading, currentUserId, onEdit, onDelete }: UserTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên đăng nhập</TableHead>
          <TableHead>Họ tên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>
                {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
              </TableCell>
              <TableCell>{user.email || '—'}</TableCell>
              <TableCell>
                <Badge variant={ROLE_VARIANTS[user.role]}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(user)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(user)}
                    disabled={user.id === currentUserId}
                    title={user.id === currentUserId ? 'Không thể xóa tài khoản của chính mình' : undefined}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
