import { cn } from '@/lib/utils';
import { AssetStatus } from '@/types/maintenance';

interface AssetStatusIndicatorProps {
  status: AssetStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  online: { label: 'Hoạt động', className: 'status-online' },
  warning: { label: 'Cảnh báo', className: 'status-warning' },
  critical: { label: 'Nghiêm trọng', className: 'status-critical' },
  offline: { label: 'Ngừng hoạt động', className: 'status-offline' },
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function AssetStatusIndicator({ status, showLabel = false, size = 'md' }: AssetStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('status-indicator', config.className, sizeClasses[size])} />
      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          status === 'online' && 'text-success',
          status === 'warning' && 'text-warning',
          status === 'critical' && 'text-destructive',
          status === 'offline' && 'text-muted-foreground'
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}
