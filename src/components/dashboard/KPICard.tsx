import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default'
}: KPICardProps) {
  const variantClasses = {
    default: 'kpi-card',
    success: 'kpi-card kpi-card-success',
    warning: 'kpi-card kpi-card-warning',
    danger: 'kpi-card kpi-card-danger',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className={cn(variantClasses[variant], 'animate-fade-in')}>
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {trendValue && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColor)}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 text-primary ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
}
