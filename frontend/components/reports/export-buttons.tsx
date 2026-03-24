'use client';

// export-buttons.tsx — Date range picker + Excel/PDF download buttons.
// Uses apiClient with responseType: 'blob' to trigger browser file download.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';

type ExportFormat = 'excel' | 'pdf';

interface ExportConfig {
  format: ExportFormat;
  endpoint: string;
  filename: string;
  contentType: string;
}

const EXPORT_CONFIGS: Record<ExportFormat, ExportConfig> = {
  excel: {
    format: 'excel',
    endpoint: '/analytics/export/excel/',
    filename: 'don-hang.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  pdf: {
    format: 'pdf',
    endpoint: '/analytics/export/pdf/',
    filename: 'bao-cao-don-hang.pdf',
    contentType: 'application/pdf',
  },
};

export default function ExportButtons() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoading(format);
    setError(null);

    const config = EXPORT_CONFIGS[format];
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    try {
      const response = await apiClient.get(config.endpoint, {
        params,
        responseType: 'blob',
      });

      // Create temporary download link and trigger click
      const blob = new Blob([response.data], { type: config.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = config.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError(`Không thể xuất file ${format === 'excel' ? 'Excel' : 'PDF'}. Vui lòng thử lại.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Từ ngày</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Đến ngày</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          onClick={() => handleExport('excel')}
          disabled={loading !== null}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {loading === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
        <Button
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          variant="outline"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {loading === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
