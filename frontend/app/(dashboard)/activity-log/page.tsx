'use client';

// Activity log page — admin-only view of all system audit events with filters

import { useState, useEffect, useCallback } from 'react';
import ActivityLogTable from '@/components/activity-log/activity-log-table';
import PaginationControls from '@/components/shared/pagination-controls';
import { notificationService } from '@/lib/services/notification-service';
import type { ActivityLog } from '@/types/notification';

const PAGE_SIZE = 20;

export default function ActivityLogPage() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchData = useCallback(
    async (pg: number, entityType: string, action: string) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
        if (entityType !== 'all') params.entity_type = entityType;
        if (action !== 'all') params.action = action;
        const res = await notificationService.listActivityLogs(params);
        setData(res.data.results);
        setTotal(res.data.count);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(page, entityTypeFilter, actionFilter);
  }, [page, entityTypeFilter, actionFilter, fetchData]);

  const handleEntityTypeChange = (value: string) => {
    setPage(1);
    setEntityTypeFilter(value);
  };

  const handleActionChange = (value: string) => {
    setPage(1);
    setActionFilter(value);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nhật ký hoạt động</h1>

      <ActivityLogTable
        data={data}
        loading={loading}
        entityTypeFilter={entityTypeFilter}
        actionFilter={actionFilter}
        onEntityTypeChange={handleEntityTypeChange}
        onActionChange={handleActionChange}
      />

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
