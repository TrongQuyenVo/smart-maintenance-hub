import { Badge } from '@/components/ui/badge';
import { WOSource } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { Clock, Activity, Hand } from 'lucide-react';

interface WOSourceBadgeProps {
  source: WOSource;
  className?: string;
}

const sourceConfig: Record<WOSource, {
  label: string;
  className: string;
  icon: React.ElementType;
}> = {
  TBM: {
    label: 'TBM',
    className: 'bg-info/10 text-info border-info/20',
    icon: Clock,
  },
  CBM: {
    label: 'CBM',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Activity,
  },
  Manual: {
    label: 'Thủ công',
    className: 'bg-muted text-muted-foreground border-border',
    icon: Hand,
  },
};

export function WOSourceBadge({ source, className }: WOSourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1', config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
