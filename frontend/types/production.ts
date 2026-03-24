// Production progress domain types

export type ProductionStage = 'cutting' | 'sewing' | 'finishing' | 'quality_check' | 'packaging';
export type ProductionStatus = 'not_started' | 'in_progress' | 'completed';

export const STAGE_LABELS: Record<ProductionStage, string> = {
  cutting: 'Cắt vải',
  sewing: 'May',
  finishing: 'Hoàn thiện',
  quality_check: 'Kiểm tra chất lượng',
  packaging: 'Đóng gói',
};

export const STATUS_LABELS: Record<ProductionStatus, string> = {
  not_started: 'Chưa bắt đầu',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
};

export interface ProductionProgress {
  id: number;
  order: number;
  order_id?: string;
  customer_name?: string;
  stage: ProductionStage;
  status: ProductionStatus;
  start_date: string | null;
  end_date: string | null;
  assigned_to: string;
  notes: string;
  updated_at: string;
}
