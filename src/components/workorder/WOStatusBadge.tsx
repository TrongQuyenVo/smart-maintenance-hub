import { Badge } from '@/components/ui/badge';
import { WOStatus } from '@/types/maintenance';
import { cn } from '@/lib/utils';

interface WOStatusBadgeProps {
  status: WOStatus;
  className?: string;
}

const statusConfig: Record<WOStatus, { label: string; className: string }> = {
  open: {
    label: 'Mở',
    className: 'bg-info/20 text-info border-info/30 hover:bg-info/30',
  },
  in_progress: {
    label: 'Đang xử lý',
    className: 'bg-warning/20 text-warning border-warning/30 hover:bg-warning/30',
  },
  done: {
    label: 'Hoàn thành',
    className: 'bg-success/20 text-success border-success/30 hover:bg-success/30',
  },
  overdue: {
    label: 'Quá hạn',
    className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
  },
};

export function WOStatusBadge({ status, className }: WOStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
