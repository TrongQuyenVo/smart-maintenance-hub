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
import { cn } from '@/lib/utils';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const asset = mockAssets.find(a => a.id === id);
  const assetWorkOrders = mockWorkOrders.filter(wo => wo.assetId === id);
  const assetAlerts = mockAlerts.filter(a => a.assetId === id);
  const assetTBMPolicies = mockTBMPolicies.filter(p => p.assetId === id);
  const assetCBMPolicies = mockCBMPolicies.filter(p => p.assetId === id);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Asset not found</p>
        <Button variant="outline" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assets
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
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-muted-foreground">{asset.id}</span>
              <AssetStatusIndicator status={asset.status} />
              <Badge variant="outline">{asset.type}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{asset.location}</span>
            </div>
          </div>
        </div>

        <Button onClick={() => navigate(`/work-orders?asset=${asset.id}`)}>
          <Plus className="w-4 h-4 mr-2" />
          Create WO
        </Button>
      </div>

      {/* Tabs - SC02 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Server className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="gap-2">
            <Activity className="w-4 h-4" />
            Telemetry
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <FileText className="w-4 h-4" />
            Docs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Specifications */}
            <Card className="lg:col-span-2 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(asset.specifications).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="font-mono font-medium">{value}</p>
                  </div>
                ))}
                {asset.manufacturer && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{asset.manufacturer}</p>
                  </div>
                )}
                {asset.model && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-mono font-medium">{asset.model}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Install Date</p>
                  <p className="font-mono">{new Date(asset.installDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </Card>

            {/* Maintenance Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Maintenance Summary</h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-info/10 border border-info/30">
                  <p className="text-sm text-muted-foreground">TBM Next Due</p>
                  <p className="font-mono text-lg text-info">
                    {asset.nextMaintenance 
                      ? new Date(asset.nextMaintenance).toLocaleDateString('vi-VN')
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                
                {lastCBMAlert && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <p className="text-sm text-muted-foreground">Last CBM Alert</p>
                    </div>
                    <p className="font-medium capitalize">{lastCBMAlert.metric}: {lastCBMAlert.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lastCBMAlert.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Last Maintenance</p>
                  <p className="font-mono">
                    {asset.lastMaintenance 
                      ? new Date(asset.lastMaintenance).toLocaleDateString('vi-VN')
                      : 'Never'
                    }
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total WO History</p>
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
              <h3 className="font-semibold mb-4">Work Order History</h3>
              <div className="space-y-3">
                {assetWorkOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No work orders for this asset</p>
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
                            Due: {new Date(wo.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Assignee</p>
                          <p className="font-medium">{wo.assignee || 'Unassigned'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            {/* Policies */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Active Policies</h3>
              <div className="space-y-4">
                {assetTBMPolicies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-lg bg-info/10 border border-info/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">TBM</Badge>
                      <span className="font-mono text-xs">{policy.id}</span>
                    </div>
                    <p className="font-medium">Every {policy.intervalDays} days</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next: {new Date(policy.nextDueDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
                
                {assetCBMPolicies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">CBM</Badge>
                      <span className="font-mono text-xs">{policy.id}</span>
                    </div>
                    <p className="font-medium capitalize">{policy.metric}</p>
                    <p className="text-sm text-muted-foreground">
                      Threshold: {policy.operator === 'gt' ? '>' : '<'} {policy.threshold}
                    </p>
                  </div>
                ))}

                {assetTBMPolicies.length === 0 && assetCBMPolicies.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No policies configured</p>
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
                Temperature Trend (24h)
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
                <h3 className="font-semibold mb-4">Current Trend</h3>
                <TelemetryChart
                  assetId={asset.id}
                  metric="current"
                  threshold={assetCBMPolicies.find(p => p.metric === 'current')?.threshold}
                  hours={24}
                />
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Vibration Trend</h3>
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
              Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['User Manual', 'Technical Spec', 'Wiring Diagram', 'Maintenance Guide'].map((doc) => (
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
                <p className="text-muted-foreground">Upload Document</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
