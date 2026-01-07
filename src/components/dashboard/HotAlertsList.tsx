import { AlertTriangle, ThermometerSun, Zap, Gauge, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { mockAlerts } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { MetricType, AlertSeverity } from '@/types/maintenance';

const metricIcons: Record<MetricType, React.ElementType> = {
  temperature: ThermometerSun,
  current: Zap,
  pressure: Gauge,
  vibration: Activity,
  humidity: Activity,
};

const severityColors: Record<AlertSeverity, string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-info/20 text-info border-info/30',
  low: 'bg-muted text-muted-foreground border-border',
};

export function HotAlertsList() {
  // keep a ticking clock so relative times update in real-time
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000); // update each minute
    return () => clearInterval(t);
  }, []);

  const activeAlerts = mockAlerts
    .filter(a => !a.resolvedAt)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 5);

  const timeAgo = (iso: string) => {
    const diffSec = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s trước`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">Cảnh báo nghiêm trọng</h3>
        </div>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          {activeAlerts.length} Hoạt động
        </Badge>
      </div>

      <div className="divide-y divide-border/50">
        {activeAlerts.map((alert) => {
          const MetricIcon = metricIcons[alert.metric];

          return (
            <div
              key={alert.id}
              className={cn(
                'p-4 flex items-start gap-4 transition-colors hover:bg-muted/30',
                !alert.acknowledged && 'bg-destructive/5'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg',
                alert.severity === 'critical' && 'bg-destructive/20',
                alert.severity === 'high' && 'bg-warning/20',
                alert.severity === 'medium' && 'bg-info/20',
                alert.severity === 'low' && 'bg-muted'
              )}>
                <MetricIcon className={cn(
                  'w-5 h-5',
                  alert.severity === 'critical' && 'text-destructive',
                  alert.severity === 'high' && 'text-warning',
                  alert.severity === 'medium' && 'text-info',
                  alert.severity === 'low' && 'text-muted-foreground'
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{alert.assetName}</p>
                  <Badge className={cn('shrink-0', severityColors[alert.severity])}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.metric}: <span className="text-foreground font-mono">{alert.value}</span>
                  {' > '}
                  <span className="text-warning font-mono">{alert.threshold}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(alert.timestamp)}</p>
              </div>

              {!alert.acknowledged && (
                <div className="status-indicator status-critical pulse-dot shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {activeAlerts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Không có cảnh báo đang hoạt động</p>
        </div>
      )}
    </div>
  );
}
