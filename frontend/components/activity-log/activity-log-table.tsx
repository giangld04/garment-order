'use client';

// Activity log table — shows all audit events with filters for entity_type and action

import type { ActivityLog } from '@/types/notification';

interface ActivityLogTableProps {
  data: ActivityLog[];
  loading: boolean;
  entityTypeFilter: string;
  actionFilter: string;
  onEntityTypeChange: (value: string) => void;
  onActionChange: (value: string) => void;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
};

export default function ActivityLogTable({
  data,
  loading,
  entityTypeFilter,
  actionFilter,
  onEntityTypeChange,
  onActionChange,
}: ActivityLogTableProps) {
  // Derive unique entity types from current data for filter options
  const entityTypes = Array.from(new Set(data.map((l) => l.entity_type))).sort();

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={entityTypeFilter}
          onChange={(e) => onEntityTypeChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tất cả loại</option>
          {entityTypes.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => onActionChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tất cả hành động</option>
          <option value="create">Tạo mới</option>
          <option value="update">Cập nhật</option>
          <option value="delete">Xóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Người dùng</th>
              <th className="px-4 py-2 text-left font-medium">Hành động</th>
              <th className="px-4 py-2 text-left font-medium">Đối tượng</th>
              <th className="px-4 py-2 text-left font-medium">ID</th>
              <th className="px-4 py-2 text-left font-medium">Chi tiết</th>
              <th className="px-4 py-2 text-left font-medium">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {!loading &&
              data.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2">{log.user_name || '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        log.action === 'create'
                          ? 'bg-green-100 text-green-700'
                          : log.action === 'delete'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.entity_type}</td>
                  <td className="px-4 py-2">{log.entity_id}</td>
                  <td className="max-w-xs px-4 py-2">
                    <code className="block truncate text-xs text-muted-foreground">
                      {Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : '—'}
                    </code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
