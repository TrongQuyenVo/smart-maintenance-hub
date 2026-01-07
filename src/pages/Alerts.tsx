import { useState } from 'react';
import { Bell, Check, AlertTriangle, ThermometerSun, Zap, Gauge, Activity, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAlerts } from '@/data/mockData';
import { Alert, AlertSeverity, MetricType } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const metricIcons: Record<MetricType, React.ElementType> = {
  temperature: ThermometerSun,
  current: Zap,
  pressure: Gauge,
  vibration: Activity,
  humidity: Activity,
};

const metricLabels: Record<MetricType, string> = {
  temperature: 'Nhiệt độ',
  current: 'Dòng điện',
  pressure: 'Áp suất',
  vibration: 'Rung động',
  humidity: 'Độ ẩm',
};

const severityConfig: Record<AlertSeverity, {
  label: string;
  className: string;
  bgClass: string;
}> = {
  critical: {
    label: 'Nghiêm trọng',
    className: 'bg-destructive text-destructive-foreground',
    bgClass: 'bg-destructive/10 border-destructive/30',
  },
  high: {
    label: 'Cao',
    className: 'bg-warning text-warning-foreground',
    bgClass: 'bg-warning/10 border-warning/30',
  },
  medium: {
    label: 'Trung bình',
    className: 'bg-info text-info-foreground',
    bgClass: 'bg-info/10 border-info/30',
  },
  low: {
    label: 'Thấp',
    className: 'bg-muted text-muted-foreground',
    bgClass: 'bg-muted/50 border-border',
  },
};

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(a =>
      a.id === id ? { ...a, acknowledged: true } : a
    ));
    toast.success('Đã xác nhận cảnh báo');
  };

  const createWOFromAlert = (alert: Alert) => {
    toast.success(`Đã tạo lệnh công việc từ cảnh báo ${alert.id}`);
    navigate('/work-orders');
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !alert.resolvedAt && !alert.acknowledged) ||
      (statusFilter === 'acknowledged' && alert.acknowledged && !alert.resolvedAt) ||
      (statusFilter === 'resolved' && alert.resolvedAt);

    return matchesSeverity && matchesStatus;
  });

  const activeCount = alerts.filter(a => !a.resolvedAt && !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length;

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xl sm:text-2xl font-bold">Trung tâm cảnh báo</span>
          <p className="text-sm sm:text-base text-muted-foreground">
            Giám sát và quản lý các vi phạm ngưỡng CBM
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            <span className="font-mono text-xs sm:text-sm text-destructive">{criticalCount} Nghiêm trọng</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-warning/10 border border-warning/30">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            <span className="font-mono text-xs sm:text-sm text-warning">{activeCount} Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as AlertSeverity | 'all')}>
          <SelectTrigger className="w-full sm:w-[150px] bg-muted/50">
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="critical">Nghiêm trọng</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-muted/50">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Chưa xác nhận</SelectItem>
            <SelectItem value="acknowledged">Đã xác nhận</SelectItem>
            <SelectItem value="resolved">Đã xử lý</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredAlerts.map((alert, index) => {
          const MetricIcon = metricIcons[alert.metric];
          const config = severityConfig[alert.severity];
          const timestamp = new Date(alert.timestamp);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'p-3 sm:p-4 border-2 transition-all',
                  config.bgClass,
                  !alert.acknowledged && !alert.resolvedAt && 'animate-pulse'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0',
                    alert.severity === 'critical' && 'bg-destructive/20',
                    alert.severity === 'high' && 'bg-warning/20',
                    alert.severity === 'medium' && 'bg-info/20',
                    alert.severity === 'low' && 'bg-muted'
                  )}>
                    <MetricIcon className={cn(
                      'w-5 h-5 sm:w-6 sm:h-6',
                      alert.severity === 'critical' && 'text-destructive',
                      alert.severity === 'high' && 'text-warning',
                      alert.severity === 'medium' && 'text-info',
                      alert.severity === 'low' && 'text-muted-foreground'
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={cn(config.className, 'text-xs')}>
                        {config.label}
                      </Badge>
                      <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{alert.id}</span>
                      {alert.acknowledged && !alert.resolvedAt && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                          Đã xác nhận
                        </Badge>
                      )}
                      {alert.resolvedAt && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                          Đã xử lý
                        </Badge>
                      )}
                    </div>

                    <h3
                      className="font-semibold text-sm sm:text-base cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/assets/${alert.assetId}`)}
                    >
                      {alert.assetName}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {metricLabels[alert.metric]}:{' '}
                      <span className="font-mono text-foreground">{alert.value}</span>
                      {' vượt ngưỡng '}
                      <span className="font-mono text-warning">{alert.threshold}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
                      <span>
                        {timestamp.toLocaleDateString('vi-VN')} {timestamp.toLocaleTimeString('vi-VN')}
                      </span>
                      {alert.resolvedAt && (
                        <span className="text-success">
                          Xử lý: {new Date(alert.resolvedAt).toLocaleTimeString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!alert.acknowledged && !alert.resolvedAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Xác nhận
                      </Button>
                    )}
                    {!alert.resolvedAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createWOFromAlert(alert)}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Tạo WO
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/telemetry?asset=${alert.assetId}&metric=${alert.metric}`)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      Xem biểu đồ
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Không có cảnh báo phù hợp với bộ lọc</p>
        </Card>
      )}
    </motion.div>
  );
}
