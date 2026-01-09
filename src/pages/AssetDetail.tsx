import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  MapPin,
  Calendar,
  Settings,
  FileText,
  Activity,
  Wrench,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetStatusIndicator } from '@/components/assets/AssetStatusIndicator';
import { TelemetryChart } from '@/components/telemetry/TelemetryChart';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { mockAssets, mockWorkOrders, mockAlerts, mockTBMPolicies, mockCBMPolicies, generateTelemetryData } from '@/data/mockData';
import { cn, getAssetTypeLabel } from '@/lib/utils';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const asset = mockAssets.find(a => a.id === id);
  const assetWorkOrders = mockWorkOrders.filter(wo => wo.assetId === id);
  const assetAlerts = mockAlerts.filter(a => a.assetId === id);
  const assetTBMPolicies = mockTBMPolicies.filter(p => p.assetId === id);
  const assetCBMPolicies = mockCBMPolicies.filter(p => p.assetId === id);

  const metricLabels: Record<string, string> = {
    temperature: 'Nhiệt độ',
    current: 'Dòng điện',
    pressure: 'Áp suất',
    vibration: 'Rung động',
    humidity: 'Độ ẩm',
  };

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Không tìm thấy thiết bị</p>
        <Button variant="outline" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Thiết bị
        </Button>
      </div>
    );
  }

  const lastCBMAlert = assetAlerts.find(a => !a.resolvedAt);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 w-full">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-muted-foreground">{asset.id}</span>
              <AssetStatusIndicator status={asset.status} />
              <Badge variant="outline">{getAssetTypeLabel(asset.type)}</Badge>
            </div>
            <span className="text-2xl font-bold">{asset.name}</span>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{asset.location}</span>
            </div>
          </div>
        </div>

        <Button className="w-full sm:w-auto mt-3 sm:mt-0" onClick={() => navigate(`/work-orders?asset=${asset.id}`)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo lệnh công việc
        </Button>
      </div>

      {/* Tabs - SC02 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full overflow-x-auto flex-nowrap whitespace-nowrap -mx-1 justify-start pl-1" style={{ touchAction: 'pan-x' }}>
          <TabsTrigger value="overview" className="inline-flex gap-2 min-w-max mx-1">
            <Server className="w-4 h-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="inline-flex gap-2 min-w-max mx-1">
            <Wrench className="w-4 h-4" />
            Bảo trì
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="inline-flex gap-2 min-w-max mx-1">
            <Activity className="w-4 h-4" />
            Số liệu
          </TabsTrigger>
          <TabsTrigger value="docs" className="inline-flex gap-2 min-w-max mx-1">
            <FileText className="w-4 h-4" />
            Tài liệu
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Specifications */}
            <Card className="lg:col-span-2 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(asset.specifications).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="font-mono font-medium">{value}</p>
                  </div>
                ))}
                {asset.manufacturer && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Nhà sản xuất</p>
                    <p className="font-medium">{asset.manufacturer}</p>
                  </div>
                )}
                {asset.model && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Mẫu</p>
                    <p className="font-mono font-medium">{asset.model}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Ngày lắp đặt</p>
                  <p className="font-mono">{new Date(asset.installDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </Card>

            {/* Maintenance Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Tổng quan bảo trì</h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-info/10 border border-info/30">
                  <p className="text-sm text-muted-foreground">Hạn TBM tiếp theo</p>
                  <p className="font-mono text-lg text-info">
                    {asset.nextMaintenance
                      ? new Date(asset.nextMaintenance).toLocaleDateString('vi-VN')
                      : 'Chưa lên lịch'
                    }
                  </p>
                </div>

                {lastCBMAlert && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <p className="text-sm text-muted-foreground">Cảnh báo CBM gần nhất</p>
                    </div>
                    <p className="font-medium capitalize">{lastCBMAlert.metric}: {lastCBMAlert.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lastCBMAlert.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Bảo trì gần nhất</p>
                  <p className="font-mono">
                    {asset.lastMaintenance
                      ? new Date(asset.lastMaintenance).toLocaleDateString('vi-VN')
                      : 'Chưa'
                    }
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Tổng số lệnh</p>
                  <p className="font-mono text-2xl">{assetWorkOrders.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab - WO History */}
        <TabsContent value="maintenance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* WO History List */}
            <Card className="lg:col-span-2 p-6">
              <h3 className="font-semibold mb-4">Lịch sử lệnh công việc</h3>
              <div className="space-y-3">
                {assetWorkOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Không có lệnh công việc cho thiết bị này</p>
                ) : (
                  assetWorkOrders.map((wo) => (
                    <motion.div
                      key={wo.id}
                      className="p-4 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-primary">{wo.id}</span>
                            <WOSourceBadge source={wo.source} />
                            <WOStatusBadge status={wo.status} />
                          </div>
                          <h4 className="font-medium">{wo.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Hạn: {new Date(wo.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Người được giao</p>
                          <p className="font-medium">{wo.assignee || 'Chưa phân công'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            {/* Policies */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Chính sách đang hoạt động</h3>
              <div className="space-y-4">
                {assetTBMPolicies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-lg bg-info/10 border border-info/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">TBM</Badge>
                      <span className="font-mono text-xs">{policy.id}</span>
                    </div>
                    <p className="font-medium">Chu kỳ: {policy.intervalDays} ngày</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hạn tiếp theo: {new Date(policy.nextDueDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}

                {assetCBMPolicies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">CBM</Badge>
                      <span className="font-mono text-xs">{policy.id}</span>
                    </div>
                    <p className="font-medium">{metricLabels[policy.metric]}</p>
                    <p className="text-sm text-muted-foreground">
                      Ngưỡng: {policy.operator === 'gt' ? '>' : '<'} {policy.threshold}
                    </p>
                  </div>
                ))}

                {assetTBMPolicies.length === 0 && assetCBMPolicies.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Chưa có chính sách nào được cấu hình</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry">
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Xu hướng nhiệt độ (24h)
              </h3>
              <TelemetryChart
                assetId={asset.id}
                metric="temperature"
                threshold={assetCBMPolicies.find(p => p.metric === 'temperature')?.threshold}
                hours={24}
              />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Xu hướng dòng điện</h3>
                <TelemetryChart
                  assetId={asset.id}
                  metric="current"
                  threshold={assetCBMPolicies.find(p => p.metric === 'current')?.threshold}
                  hours={24}
                />
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Xu hướng rung động</h3>
                <TelemetryChart
                  assetId={asset.id}
                  metric="vibration"
                  threshold={assetCBMPolicies.find(p => p.metric === 'vibration')?.threshold}
                  hours={24}
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Docs Tab */}
        <TabsContent value="docs">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tài liệu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Hướng dẫn sử dụng', 'Thông số kỹ thuật', 'Sơ đồ đấu dây', 'Hướng dẫn bảo trì'].map((doc) => (
                <div
                  key={doc}
                  className="p-4 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="font-medium">{doc}</p>
                  <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                </div>
              ))}
              <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors flex flex-col items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Tải lên tài liệu</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
