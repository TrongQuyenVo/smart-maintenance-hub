import { useState } from 'react';
import { Activity, ThermometerSun, Zap, Gauge, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelemetryChart } from '@/components/telemetry/TelemetryChart';
import { mockAssets, mockCBMPolicies } from '@/data/mockData';
import { MetricType } from '@/types/maintenance';
import { cn } from '@/lib/utils';

const metrics: { value: MetricType; label: string; icon: React.ElementType; unit: string }[] = [
  { value: 'temperature', label: 'Nhiệt độ', icon: ThermometerSun, unit: '°C' },
  { value: 'current', label: 'Dòng điện', icon: Zap, unit: 'A' },
  { value: 'pressure', label: 'Áp suất', icon: Gauge, unit: 'bar' },
  { value: 'vibration', label: 'Rung động', icon: Waves, unit: 'mm/s' },
];

export default function Telemetry() {
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0].id);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');
  const [timeRange, setTimeRange] = useState('24');

  const asset = mockAssets.find(a => a.id === selectedAsset);
  const cbmPolicy = mockCBMPolicies.find(
    p => p.assetId === selectedAsset && p.metric === selectedMetric
  );

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Giám sát dữ liệu cảm biến</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Dữ liệu thời gian thực và phân tích xu hướng
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <Select value={selectedAsset} onValueChange={setSelectedAsset}>
          <SelectTrigger className="w-full sm:w-[300px] bg-muted/50">
            <SelectValue placeholder="Chọn thiết bị" />
          </SelectTrigger>
          <SelectContent>
            {mockAssets.map(asset => (
              <SelectItem key={asset.id} value={asset.id}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{asset.id}</span>
                  <span>{asset.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[150px] bg-muted/50">
            <SelectValue placeholder="Khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 giờ qua</SelectItem>
            <SelectItem value="6">6 giờ qua</SelectItem>
            <SelectItem value="24">24 giờ qua</SelectItem>
            <SelectItem value="72">3 ngày qua</SelectItem>
            <SelectItem value="168">7 ngày qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Asset Info */}
      {asset && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm sm:text-base truncate">{asset.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{asset.location}</p>
            </div>
            <div className={cn(
              'px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium',
              asset.status === 'online' && 'bg-success/20 text-success',
              asset.status === 'warning' && 'bg-warning/20 text-warning',
              asset.status === 'critical' && 'bg-destructive/20 text-destructive',
              asset.status === 'offline' && 'bg-muted text-muted-foreground'
            )}>
              {asset.status === 'online' && 'Hoạt động'}
              {asset.status === 'warning' && 'Cảnh báo'}
              {asset.status === 'critical' && 'Nghiêm trọng'}
              {asset.status === 'offline' && 'Ngừng'}
            </div>
          </div>
        </Card>
      )}

      {/* Metric Tabs */}
      <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto flex-nowrap">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <TabsTrigger key={metric.value} value={metric.value} className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{metric.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {metrics.map(metric => (
          <TabsContent key={metric.value} value={metric.value}>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Xu hướng {metric.label}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {timeRange} giờ qua
                    </p>
                  </div>
                </div>
                {cbmPolicy && (
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">Ngưỡng CBM</p>
                    <p className="font-mono text-base sm:text-lg text-warning">
                      {cbmPolicy.threshold} {metric.unit}
                    </p>
                  </div>
                )}
              </div>

              <TelemetryChart
                assetId={selectedAsset}
                metric={metric.value}
                threshold={cbmPolicy?.threshold}
                hours={parseInt(timeRange)}
              />
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Live Values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          const randomValue = (
            metric.value === 'temperature' ? 35 + Math.random() * 10 :
            metric.value === 'current' ? 28 + Math.random() * 10 :
            metric.value === 'pressure' ? 4 + Math.random() * 2 :
            1 + Math.random() * 3
          ).toFixed(1);

          return (
            <motion.div
              key={metric.value}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                className={cn(
                  'p-3 sm:p-4 cursor-pointer transition-all',
                  selectedMetric === metric.value && 'border-primary shadow-glow'
                )}
                onClick={() => setSelectedMetric(metric.value)}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono">{randomValue}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <div className="status-indicator status-online" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Trực tiếp</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
