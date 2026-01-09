import { useEffect, useState } from 'react';
import { Clock, Activity, Plus, Settings, AlertTriangle, Trash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Modal, Form, Input as AntInput, Select as AntSelect, Switch as AntSwitch } from 'antd';



import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTBMPolicies, mockCBMPolicies, mockAssets } from '@/data/mockData';
import { TBMPolicy, CBMPolicy, MetricType } from '@/types/maintenance';
import { cn } from '@/lib/utils';

export default function Policies() {
  const [tbmPolicies, setTBMPolicies] = useState<TBMPolicy[]>(mockTBMPolicies);
  const [cbmPolicies, setCBMPolicies] = useState<CBMPolicy[]>(mockCBMPolicies);

  // Dialog / Form state for TBM (Antd Form)
  const [isTBMDialogOpen, setTBMDialogOpen] = useState(false);
  const [editingTBM, setEditingTBM] = useState<TBMPolicy | null>(null);
  const [tbmForm] = Form.useForm();

  // Dialog / Form state for CBM (Antd Form)
  const [isCBMDialogOpen, setCBMDialogOpen] = useState(false);
  const [editingCBM, setEditingCBM] = useState<CBMPolicy | null>(null);
  const [cbmForm] = Form.useForm();

  // persist policies in localStorage
  useEffect(() => {
    const rawTBM = localStorage.getItem('tbmPolicies');
    const rawCBM = localStorage.getItem('cbmPolicies');
    if (rawTBM) {
      try { setTBMPolicies(JSON.parse(rawTBM)); } catch (e) { console.warn('Failed to parse tbmPolicies from localStorage', e); }
    }
    if (rawCBM) {
      try { setCBMPolicies(JSON.parse(rawCBM)); } catch (e) { console.warn('Failed to parse cbmPolicies from localStorage', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tbmPolicies', JSON.stringify(tbmPolicies));
  }, [tbmPolicies]);

  useEffect(() => {
    localStorage.setItem('cbmPolicies', JSON.stringify(cbmPolicies));
  }, [cbmPolicies]);

  const toggleTBMPolicy = (id: string) => {
    setTBMPolicies(policies =>
      policies.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );
  };

  const toggleCBMPolicy = (id: string) => {
    setCBMPolicies(policies =>
      policies.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );
  };



  const openCreateTBM = () => { tbmForm.resetFields(); setEditingTBM(null); setTBMDialogOpen(true); };
  const openEditTBM = (p: TBMPolicy) => {
    setEditingTBM(p);
    tbmForm.setFieldsValue({ assetId: p.assetId, intervalDays: p.intervalDays, nextDueDate: p.nextDueDate ? p.nextDueDate.split('T')[0] : '', checklist: (p.checklistTemplate || []).join(', ') });
    setTBMDialogOpen(true);
  };

  const saveTBM = async () => {
    try {
      const values = await tbmForm.validateFields();
      const checklistArr = values.checklist ? String(values.checklist).split(',').map((s: string) => s.trim()) : undefined;

      if (editingTBM) {
        setTBMPolicies(prev => prev.map(p => p.id === editingTBM.id ? { ...p, assetId: values.assetId, intervalDays: Number(values.intervalDays), nextDueDate: values.nextDueDate || p.nextDueDate, checklistTemplate: checklistArr } : p));
      } else {
        const newPolicy: TBMPolicy = {
          id: `TBM-${Date.now().toString(36)}`,
          assetId: values.assetId || mockAssets[0].id,
          intervalDays: Number(values.intervalDays),
          nextDueDate: values.nextDueDate || new Date().toISOString(),
          // set lastExecuted to now so the UI shows "Thực hiện lần cuối" immediately after creation
          lastExecuted: new Date().toISOString(),
          isActive: true,
          checklistTemplate: checklistArr,
        };
        setTBMPolicies(prev => [newPolicy, ...prev]);
      }

      setTBMDialogOpen(false);
      tbmForm.resetFields();
    } catch (err) {
      console.warn('TBM save failed', err);
    }
  };

  const deleteTBM = (id: string) => {
    setTBMPolicies(prev => prev.filter(p => p.id !== id));
  };

  const openCreateCBM = () => { cbmForm.resetFields(); setEditingCBM(null); setCBMDialogOpen(true); };
  const openEditCBM = (p: CBMPolicy) => {
    setEditingCBM(p);
    cbmForm.setFieldsValue({ assetId: p.assetId, metric: p.metric, threshold: p.threshold, operator: p.operator, durationMinutes: p.durationMinutes, priority: p.priority, overrideTBM: p.overrideTBM });
    setCBMDialogOpen(true);
  };

  const saveCBM = async () => {
    try {
      const values = await cbmForm.validateFields();

      if (editingCBM) {
        setCBMPolicies(prev => prev.map(p => p.id === editingCBM.id ? { ...p, assetId: values.assetId, metric: values.metric, threshold: Number(values.threshold), operator: values.operator, durationMinutes: Number(values.durationMinutes), priority: Number(values.priority), overrideTBM: Boolean(values.overrideTBM) } : p));
      } else {
        const newPolicy: CBMPolicy = {
          id: `CBM-${Date.now().toString(36)}`,
          assetId: values.assetId || mockAssets[0].id,
          metric: values.metric,
          threshold: Number(values.threshold),
          operator: values.operator,
          durationMinutes: Number(values.durationMinutes),
          priority: Number(values.priority),
          isActive: true,
          overrideTBM: Boolean(values.overrideTBM),
        };
        setCBMPolicies(prev => [newPolicy, ...prev]);
      }

      setCBMDialogOpen(false);
      cbmForm.resetFields();
    } catch (err) {
      console.warn('CBM save failed', err);
    }
  };

  const deleteCBM = (id: string) => {
    setCBMPolicies(prev => prev.filter(p => p.id !== id));
  };

  const getAssetName = (assetId: string) => {
    return mockAssets.find(a => a.id === assetId)?.name || assetId;
  };

  const metricLabels: Record<MetricType, string> = {
    temperature: 'Nhiệt độ (°C)',
    current: 'Dòng điện (A)',
    pressure: 'Áp suất (bar)',
    vibration: 'Rung động (mm/s)',
    humidity: 'Độ ẩm (%)',
  };

  const operatorLabels = {
    gt: '>',
    lt: '<',
    gte: '≥',
    lte: '≤',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">Cấu hình chính sách</span>
          <p className="text-muted-foreground">
            Cấu hình lịch TBM và quy tắc ngưỡng CBM
          </p>
        </div>
      </div>

      <Tabs defaultValue="tbm" className="space-y-6">
        <TabsList className="bg-muted/50 px-2">
          <TabsTrigger value="tbm" className="gap-2 flex-shrink-0 whitespace-nowrap py-2 px-3">
            <Clock className="w-4 h-4" />
            Chính sách TBM
          </TabsTrigger>
          <TabsTrigger value="cbm" className="gap-2 flex-shrink-0 whitespace-nowrap py-2 px-3">
            <Activity className="w-4 h-4" />
            Quy tắc CBM
          </TabsTrigger>
        </TabsList>

        {/* TBM Section */}
        <TabsContent value="tbm" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/20">
                  <Clock className="w-5 h-5 text-info" />
                </div>
                <div>
                  <span className="text-lg font-semibold">Bảo trì theo thời gian</span>
                  <p className="text-sm text-muted-foreground">
                    Lên lịch công việc bảo trì định kỳ
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 w-full sm:w-auto">
                <Button onClick={openCreateTBM} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chính sách TBM
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {tbmPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    policy.isActive
                      ? 'bg-card border-info/30'
                      : 'bg-muted/30 border-border opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {policy.id}
                        </span>
                        <Badge variant="outline" className={cn(
                          policy.isActive
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {policy.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{getAssetName(policy.assetId)}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Chu kỳ (ngày)</Label>
                          <p className="font-mono text-lg">{policy.intervalDays} ngày</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Thực hiện lần cuối</Label>
                          <p className="font-mono">
                            {policy.lastExecuted
                              ? new Date(policy.lastExecuted).toLocaleDateString('vi-VN')
                              : '-'
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Hạn tiếp theo</Label>
                          <p className="font-mono text-info">
                            {new Date(policy.nextDueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {policy.checklistTemplate && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Mẫu checklist ({policy.checklistTemplate.length} mục)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {policy.checklistTemplate.slice(0, 3).map((item, idx) => (
                              <Badge key={`${policy.id}-${item}-${idx}`} variant="secondary" className="font-normal">
                                {item}
                              </Badge>
                            ))}
                            {policy.checklistTemplate.length > 3 && (
                              <Badge variant="outline">
                                +{policy.checklistTemplate.length - 3} khác
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditTBM(policy)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Xóa chính sách TBM này?')) deleteTBM(policy.id); }}>
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                      <Switch
                        checked={policy.isActive}
                        onCheckedChange={() => toggleTBMPolicy(policy.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* CBM Section */}
        <TabsContent value="cbm" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-semibold">Bảo trì theo thời gian</span>
                  <p className="text-sm text-muted-foreground">
                    Kích hoạt bảo trì dựa trên ngưỡng cảm biến
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 w-full sm:w-auto">
                <Button onClick={openCreateTBM} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm quy tắc CBM
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {cbmPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    policy.isActive
                      ? 'bg-card border-primary/30'
                      : 'bg-muted/30 border-border opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {policy.id}
                        </span>
                        <Badge variant="outline" className={cn(
                          policy.isActive
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {policy.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </Badge>
                        {policy.overrideTBM && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                            Ghi đè TBM
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{getAssetName(policy.assetId)}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Thông số</Label>
                          <p className="font-medium">{metricLabels[policy.metric]}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Điều kiện</Label>
                          <p className="font-mono text-lg">
                            {operatorLabels[policy.operator]} {policy.threshold}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Thời lượng</Label>
                          <p className="font-mono">{policy.durationMinutes} phút</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Mức ưu tiên</Label>
                          <p className={cn(
                            'font-medium',
                            policy.priority === 1 && 'text-destructive',
                            policy.priority === 2 && 'text-warning',
                            policy.priority >= 3 && 'text-muted-foreground'
                          )}>
                            P{policy.priority}
                          </p>
                        </div>
                      </div>

                      {/* Quy tắc trực quan */}
                      <div className="mt-4 p-3 rounded-lg bg-muted/30 font-mono text-sm">
                        <span className="text-muted-foreground">KHI</span>{' '}
                        <span className="text-primary">{metricLabels[policy.metric]}</span>{' '}
                        <span className="text-warning">{operatorLabels[policy.operator]} {policy.threshold}</span>{' '}
                        <span className="text-muted-foreground">TRONG</span>{' '}
                        <span className="text-info">{policy.durationMinutes} phút</span>{' '}
                        <span className="text-muted-foreground">→</span>{' '}
                        <span className="text-success">TẠO LỆNH</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditCBM(policy)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Xóa quy tắc CBM này?')) deleteCBM(policy.id); }}>
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                      <Switch
                        checked={policy.isActive}
                        onCheckedChange={() => toggleCBMPolicy(policy.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CBM Priority Info */}
          <Card className="p-4 border-warning/30 bg-warning/5">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Ưu tiên ghi đè CBM</h4>
                <p className="text-sm text-muted-foreground">
                  Khi "Ghi đè TBM" được bật, các lệnh công việc kích hoạt bởi CBM sẽ được ưu tiên
                  hơn so với bảo trì TBM đã lên lịch. Điều này đảm bảo các điều kiện nghiêm trọng được xử lý
                  ngay lập tức.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TBM Modal (Ant Design) */}
      <Modal
        title={editingTBM ? 'Chỉnh sửa TBM' : 'Thêm TBM'}
        open={isTBMDialogOpen}
        width="95vw"
        style={{ maxWidth: 520 }}
        maskStyle={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        centered
        onCancel={() => setTBMDialogOpen(false)}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => setTBMDialogOpen(false)}>Hủy</Button>,
          <Button key="save" onClick={saveTBM}>{editingTBM ? 'Lưu' : 'Tạo'}</Button>
        ]}
      >
        <Form form={tbmForm} layout="vertical" initialValues={{ intervalDays: 30 }}>
          <Form.Item name="assetId" label="Thiết bị" rules={[{ required: true, message: 'Chọn thiết bị' }]}>
            <AntSelect placeholder="Chọn thiết bị">
              {mockAssets.map(a => (
                <AntSelect.Option key={a.id} value={a.id}>{a.name}</AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>

          <Form.Item name="intervalDays" label="Chu kỳ (ngày)" rules={[{ required: true }]}>
            <AntInput type="number" />
          </Form.Item>

          <Form.Item name="nextDueDate" label="Hạn tiếp theo">
            <AntInput type="date" />
          </Form.Item>

          <Form.Item name="checklist" label="Mẫu checklist (ngăn cách bằng ,)">
            <AntInput.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* CBM Modal (Ant Design) */}
      <Modal
        title={editingCBM ? 'Chỉnh sửa CBM' : 'Thêm CBM'}
        open={isCBMDialogOpen}
        width="95vw"
        style={{ maxWidth: 520 }}
        maskStyle={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        centered
        onCancel={() => setCBMDialogOpen(false)}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => setCBMDialogOpen(false)}>Hủy</Button>,
          <Button key="save" onClick={saveCBM}>{editingCBM ? 'Lưu' : 'Tạo'}</Button>
        ]}
      >
        <Form form={cbmForm} layout="vertical" initialValues={{ metric: 'temperature', operator: 'gt', durationMinutes: 5, priority: 3 }}>
          <Form.Item name="assetId" label="Thiết bị" rules={[{ required: true, message: 'Chọn thiết bị' }]}>
            <AntSelect placeholder="Chọn thiết bị">
              {mockAssets.map(a => (
                <AntSelect.Option key={a.id} value={a.id}>{a.name}</AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>

          <Form.Item name="metric" label="Thông số" rules={[{ required: true }]}>
            <AntSelect>
              {Object.entries(metricLabels).map(([k, label]) => (
                <AntSelect.Option key={k} value={k}>{label}</AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item name="operator" label="Điều kiện" rules={[{ required: true }]}>
              <AntSelect>
                <AntSelect.Option value="gt">&gt;</AntSelect.Option>
                <AntSelect.Option value="lt">&lt;</AntSelect.Option>
                <AntSelect.Option value="gte">≥</AntSelect.Option>
                <AntSelect.Option value="lte">≤</AntSelect.Option>
              </AntSelect>
            </Form.Item>
            <Form.Item name="threshold" label="Ngưỡng" rules={[{ required: true }]}>
              <AntInput type="number" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item name="durationMinutes" label="Thời lượng (phút)" rules={[{ required: true }]}>
              <AntInput type="number" />
            </Form.Item>
            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}>
              <AntSelect>
                <AntSelect.Option value={1}>P1</AntSelect.Option>
                <AntSelect.Option value={2}>P2</AntSelect.Option>
                <AntSelect.Option value={3}>P3</AntSelect.Option>
              </AntSelect>
            </Form.Item>
          </div>

          <Form.Item name="overrideTBM" valuePropName="checked">
            <AntSwitch /> Ghi đè TBM
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
