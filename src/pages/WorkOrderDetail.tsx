import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  Calendar,
  User,
  ExternalLink,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
  Upload,
  Plus,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { ChecklistComponent } from '@/components/workorder/ChecklistComponent';
import { ImageUpload } from '@/components/workorder/ImageUpload';
import { mockWorkOrders } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { WorkOrder, ChecklistItem, WorkOrderPart } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Modal, Form, Input as AntInput, InputNumber } from 'antd';

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load work order from localStorage (fallback to mock data)
  const [localWorkOrder, setLocalWorkOrder] = useState<WorkOrder | undefined>(() => {
    const raw = localStorage.getItem('workOrders');
    const list = raw ? JSON.parse(raw) : mockWorkOrders;
    return list.find((wo: WorkOrder) => wo.id === id);
  });

  const workOrder = localWorkOrder;

  const [checklist, setChecklist] = useState<ChecklistItem[]>(workOrder?.checklist || []);
  const [notes, setNotes] = useState(workOrder?.notes || '');
  const [findings, setFindings] = useState(workOrder?.findings || '');
  const [images, setImages] = useState<string[]>(workOrder?.images || []);
  const [parts, setParts] = useState<WorkOrderPart[]>(workOrder?.parts || []);
  const [estimatedCost, setEstimatedCost] = useState(workOrder?.estimatedCost || 0);
  const [actualCost, setActualCost] = useState(workOrder?.actualCost || 0);

  // Parts modal
  const [isPartModalOpen, setPartModalOpen] = useState(false);
  const [partForm] = Form.useForm();

  useEffect(() => {
    setChecklist(workOrder?.checklist || []);
    setNotes(workOrder?.notes || '');
    setFindings(workOrder?.findings || '');
    setImages(workOrder?.images || []);
    setParts(workOrder?.parts || []);
    setEstimatedCost(workOrder?.estimatedCost || 0);
    setActualCost(workOrder?.actualCost || 0);
  }, [workOrder]);

  const hasChanges = () => {
    if (!workOrder) return false;
    return (
      notes !== (workOrder.notes || '') ||
      findings !== (workOrder.findings || '') ||
      JSON.stringify(images) !== JSON.stringify(workOrder.images || []) ||
      JSON.stringify(checklist) !== JSON.stringify(workOrder.checklist || []) ||
      JSON.stringify(parts) !== JSON.stringify(workOrder.parts || []) ||
      estimatedCost !== (workOrder.estimatedCost || 0) ||
      actualCost !== (workOrder.actualCost || 0)
    );
  };

  const updateWorkOrder = (updates: Partial<WorkOrder>) => {
    if (!workOrder) return;
    const raw = localStorage.getItem('workOrders');
    const list = raw ? JSON.parse(raw) : mockWorkOrders;
    const updated = list.map((wo: WorkOrder) => wo.id === workOrder.id ? { ...wo, ...updates } : wo);
    localStorage.setItem('workOrders', JSON.stringify(updated));
    setLocalWorkOrder(updated.find((wo: WorkOrder) => wo.id === workOrder.id));
  };

  const saveChanges = () => {
    updateWorkOrder({ notes, findings, images, checklist, parts, estimatedCost, actualCost });
    toast.success('Đã lưu thay đổi');
  };

  const resetChanges = () => {
    if (!workOrder) return;
    setChecklist(workOrder.checklist || []);
    setNotes(workOrder.notes || '');
    setFindings(workOrder.findings || '');
    setImages(workOrder.images || []);
    setParts(workOrder.parts || []);
    setEstimatedCost(workOrder.estimatedCost || 0);
    setActualCost(workOrder.actualCost || 0);
  };

  const startWO = () => {
    updateWorkOrder({ status: 'in_progress', startedAt: new Date().toISOString(), assignee: workOrder?.assignee || 'Tôi' });
    toast.success('Đã bắt đầu lệnh công việc');
  };

  const pauseWO = () => {
    updateWorkOrder({ pausedAt: new Date().toISOString() });
    toast.info('Đã tạm dừng lệnh công việc');
  };

  const closeWO = () => {
    if (!confirm('Xác nhận hoàn thành lệnh công việc này?')) return;
    updateWorkOrder({ status: 'done', completedAt: new Date().toISOString() });
    toast.success('Đã hoàn thành lệnh công việc');
  };

  const addPart = async () => {
    try {
      const values = await partForm.validateFields();
      const newPart: WorkOrderPart = {
        id: `PART-${Date.now().toString(36)}`,
        name: values.name,
        quantity: values.quantity,
        unitCost: values.unitCost,
      };
      const updatedParts = [...parts, newPart];
      setParts(updatedParts);
      // Auto-update actual cost
      const totalPartsCost = updatedParts.reduce((sum, p) => sum + (p.quantity * p.unitCost), 0);
      setActualCost(totalPartsCost);
      partForm.resetFields();
      setPartModalOpen(false);
    } catch (err) {
      console.warn('Add part failed', err);
      toast.error('Vui lòng kiểm tra thông tin vật tư');
    }
  };

  const removePart = (partId: string) => {
    const updatedParts = parts.filter(p => p.id !== partId);
    setParts(updatedParts);
    const totalPartsCost = updatedParts.reduce((sum, p) => sum + (p.quantity * p.unitCost), 0);
    setActualCost(totalPartsCost);
  };

  if (!workOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Không tìm thấy lệnh công việc</p>
        <Button variant="outline" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Lệnh công việc
        </Button>
      </div>
    );
  }

  const isEditable = workOrder.status !== 'done';
  const priorityColors = {
    low: 'border-muted-foreground/30',
    medium: 'border-info/30',
    high: 'border-warning/30',
    critical: 'border-destructive/30',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-primary text-sm">{workOrder.id}</span>
              <WOSourceBadge source={workOrder.source} />
              <WOStatusBadge status={workOrder.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{workOrder.title}</h1>
          </div>
        </div>

        {/* Actions: Start | Pause | Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {workOrder.status === 'open' && (
            <Button onClick={startWO} className="gap-2">
              <Play className="w-4 h-4" />
              Bắt đầu
            </Button>
          )}
          {workOrder.status === 'in_progress' && (
            <>
              <Button variant="outline" onClick={pauseWO} className="gap-2">
                <Pause className="w-4 h-4" />
                Tạm dừng
              </Button>
              <Button onClick={closeWO} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Hoàn thành
              </Button>
            </>
          )}
          {workOrder.status === 'overdue' && (
            <Button onClick={startWO} variant="destructive" className="gap-2">
              <Play className="w-4 h-4" />
              Bắt đầu (Quá hạn)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* CBM Trigger Info */}
          {workOrder.source === 'CBM' && workOrder.triggerInfo && (
            <Card className={cn(
              'p-4 border-2',
              priorityColors[workOrder.priority],
              'bg-warning/5'
            )}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Kích hoạt cảnh báo CBM</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="capitalize">{workOrder.triggerInfo.metric}</span>:
                    <span className="font-mono text-foreground ml-1">
                      {workOrder.triggerInfo.value}
                    </span>
                    {' vượt quá ngưỡng '}
                    <span className="font-mono text-warning">
                      {workOrder.triggerInfo.threshold}
                    </span>
                  </p>
                  {workOrder.triggerInfo.chartLink && (
                    <Link
                      to={workOrder.triggerInfo.chartLink}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      Xem biểu đồ dữ liệu
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Tabs: Checklist | Findings | Parts & Cost */}
          <Tabs defaultValue="checklist" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="checklist" className="gap-2">
                <FileText className="w-4 h-4" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="findings" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Nhận xét & Ảnh
              </TabsTrigger>
              <TabsTrigger value="cost" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Vật tư & Chi phí
              </TabsTrigger>
            </TabsList>

            {/* Checklist Tab */}
            <TabsContent value="checklist">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Checklist công việc</h2>
                <ChecklistComponent
                  items={checklist}
                  onUpdate={setChecklist}
                  readonly={!isEditable}
                />
              </Card>
            </TabsContent>

            {/* Findings Tab */}
            <TabsContent value="findings" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Kết quả & Nhận xét</h2>
                <Textarea
                  placeholder="Mô tả kết quả kiểm tra, phát hiện lỗi, khuyến nghị..."
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="min-h-[120px] bg-muted/30"
                  disabled={!isEditable}
                />
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
                <Textarea
                  placeholder="Thêm ghi chú cho lệnh công việc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-muted/30"
                  disabled={!isEditable}
                />
              </Card>

              <Card className="p-6">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  disabled={!isEditable}
                  maxImages={10}
                />
              </Card>
            </TabsContent>

            {/* Parts & Cost Tab */}
            <TabsContent value="cost" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Vật tư sử dụng</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { partForm.setFieldsValue({ quantity: 1, unitCost: 0 }); setPartModalOpen(true); }}
                    disabled={!isEditable}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm vật tư
                  </Button>
                </div>

                {parts.length > 0 ? (
                  <div className="space-y-3">
                    {parts.map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {part.quantity} x {part.unitCost.toLocaleString('vi-VN')} VND
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium">
                            {(part.quantity * part.unitCost).toLocaleString('vi-VN')} VND
                          </span>
                          {isEditable && (
                            <Button variant="ghost" size="icon" onClick={() => removePart(part.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có vật tư nào được ghi nhận
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Chi phí</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Chi phí dự toán (VND)</Label>
                    <InputNumber
                      min={0}
                      value={estimatedCost}
                      formatter={(value) => value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                      parser={(value) => value ? Number(String(value).replace(/\./g, '')) : 0}
                      onChange={(v) => setEstimatedCost(Number(v || 0))}
                      disabled={!isEditable}
                      className="bg-muted/30 mt-1"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <Label>Chi phí thực tế (VND)</Label>
                    <InputNumber
                      min={0}
                      value={actualCost}
                      formatter={(value) => value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                      parser={(value) => value ? Number(String(value).replace(/\./g, '')) : 0}
                      onChange={(v) => setActualCost(Number(v || 0))}
                      disabled={!isEditable}
                      className="bg-muted/30 mt-1"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                {actualCost > estimatedCost && estimatedCost > 0 && (
                  <p className="text-sm text-warning mt-2">
                    ⚠️ Chi phí thực tế vượt dự toán {((actualCost - estimatedCost) / estimatedCost * 100).toFixed(1)}%
                  </p>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save/Cancel Buttons */}
          {isEditable && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetChanges} disabled={!hasChanges()}>
                Hủy thay đổi
              </Button>
              <Button onClick={saveChanges} disabled={!hasChanges()}>
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Chi tiết</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground flex">Thiết bị</span>
                  <Link
                    to={`/assets/${workOrder.assetId}`}
                    className="font-medium hover:text-primary"
                  >
                    {workOrder.assetName}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground flex">Ngày đến hạn</span>
                  <span className="font-medium">
                    {new Date(workOrder.dueDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground flex">Người được giao</span>
                  <span className="font-medium">{workOrder.assignee || 'Chưa phân công'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground flex">Ngày tạo</span>
                  <span className="font-medium">
                    {new Date(workOrder.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {workOrder.startedAt && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/20">
                    <Play className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex">Bắt đầu</span>
                    <span className="font-medium">
                      {new Date(workOrder.startedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}

              {workOrder.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/20">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex">Hoàn thành</span>
                    <span className="font-medium">
                      {new Date(workOrder.completedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Priority Card */}
          <Card className={cn('p-6 border-2', priorityColors[workOrder.priority])}>
            <h3 className="font-semibold mb-2">Mức ưu tiên</h3>
            <p className={cn(
              'text-2xl font-bold',
              workOrder.priority === 'critical' && 'text-destructive',
              workOrder.priority === 'high' && 'text-warning',
              workOrder.priority === 'medium' && 'text-info',
              workOrder.priority === 'low' && 'text-muted-foreground'
            )}>
              {priorityLabels[workOrder.priority]}
            </p>
          </Card>

          {/* Cost Summary */}
          {(estimatedCost > 0 || actualCost > 0) && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Tổng chi phí</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dự toán:</span>
                  <span className="font-mono">{estimatedCost.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thực tế:</span>
                  <span className="font-mono font-medium">{actualCost.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Part Modal */}
      <Modal
        title="Thêm vật tư"
        open={isPartModalOpen}
        onCancel={() => { setPartModalOpen(false); partForm.resetFields(); }}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => setPartModalOpen(false)}>Hủy</Button>,
          <Button key="save" onClick={addPart}>Thêm</Button>
        ]}
      >
        <Form form={partForm} layout="vertical" initialValues={{ quantity: 1, unitCost: 0 }}>
          <Form.Item name="name" label="Tên vật tư" rules={[{ required: true, message: 'Nhập tên vật tư' }]}>
            <AntInput placeholder="VD: Bộ lọc khí, Dầu bôi trơn..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="unitCost" label="Đơn giá (VND)" rules={[{ required: true, message: 'Nhập đơn giá' }]}>
              <InputNumber
                min={0}
                formatter={(value) => value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                parser={(value: string | undefined) => value ? Number(String(value).replace(/\./g, '')) : 0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}