import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  Calendar,
  User,
  ExternalLink,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { ChecklistComponent } from '@/components/workorder/ChecklistComponent';
import { mockWorkOrders } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { WorkOrder, ChecklistItem } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load work order from localStorage (fallback to mock data)
  const [localWorkOrder, setLocalWorkOrder] = useState<WorkOrder | undefined>(() => {
    const raw = localStorage.getItem('workOrders');
    const list = raw ? JSON.parse(raw) : mockWorkOrders;
    return list.find((wo: WorkOrder) => wo.id === id);
  });

  const workOrder = localWorkOrder; // existing variable name used through the component

  const [checklist, setChecklist] = useState<ChecklistItem[]>(workOrder?.checklist || []);
  const [notes, setNotes] = useState(workOrder?.notes || '');

  useEffect(() => {
    setChecklist(workOrder?.checklist || []);
    setNotes(workOrder?.notes || '');
  }, [workOrder]);

  const notesChanged = notes !== workOrder?.notes;
  const checklistChanged = JSON.stringify(checklist) !== JSON.stringify(workOrder?.checklist || []);

  const saveNotes = () => {
    if (!workOrder) return;
    const raw = localStorage.getItem('workOrders');
    const list = raw ? JSON.parse(raw) : mockWorkOrders;
    const updated = list.map((wo: WorkOrder) => wo.id === workOrder.id ? { ...wo, notes, checklist } : wo);
    localStorage.setItem('workOrders', JSON.stringify(updated));
    setLocalWorkOrder(updated.find((wo: WorkOrder) => wo.id === workOrder.id));
    toast.success('Ghi chú đã được lưu');
  };

  const resetNotes = () => {
    if (!workOrder) return;
    setChecklist(workOrder.checklist || []);
    setNotes(workOrder.notes || '');
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
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-primary text-sm">{workOrder.id}</span>
              <WOSourceBadge source={workOrder.source} />
              <WOStatusBadge status={workOrder.status} />
            </div>
            <span className="text-2xl font-bold">{workOrder.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {workOrder?.status === 'open' && (
            <Button variant="outline" onClick={() => {
              // assign to 'Tôi' (local only)
              if (!workOrder) return;
              const raw = localStorage.getItem('workOrders');
              const list = raw ? JSON.parse(raw) : mockWorkOrders;
              const updated = list.map((wo: WorkOrder) => wo.id === workOrder.id ? { ...wo, assignee: 'Tôi', status: 'in_progress' } : wo);
              localStorage.setItem('workOrders', JSON.stringify(updated));
              setLocalWorkOrder(updated.find((wo: WorkOrder) => wo.id === workOrder.id));
            }}>
              Giao cho tôi
            </Button>
          )}
          {workOrder?.status === 'in_progress' && (
            <Button onClick={() => {
              if (!workOrder) return;
              if (!confirm('Xác nhận hoàn thành lệnh công việc này?')) return;
              const raw = localStorage.getItem('workOrders');
              const list = raw ? JSON.parse(raw) : mockWorkOrders;
              const updated = list.map((wo: WorkOrder) => wo.id === workOrder.id ? { ...wo, status: 'done', completedAt: new Date().toISOString() } : wo);
              localStorage.setItem('workOrders', JSON.stringify(updated));
              setLocalWorkOrder(updated.find((wo: WorkOrder) => wo.id === workOrder.id));
            }}>
              Hoàn thành lệnh
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

          {/* Checklist */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Checklist công việc</h2>
            <ChecklistComponent
              items={checklist}
              onUpdate={setChecklist}
              readonly={!isEditable}
            />
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ghi chú & nhận xét</h2>
            <Textarea
              placeholder="Thêm ghi chú cho lệnh công việc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] bg-muted/30"
              disabled={!isEditable}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" onClick={resetNotes} disabled={!isEditable || (!notesChanged && !checklistChanged)}>Hủy</Button>
              <Button onClick={saveNotes} disabled={!isEditable || (!notesChanged && !checklistChanged)}>Gửi</Button>
            </div>
          </Card>
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
                  <p className="text-sm text-muted-foreground">Thiết bị</p>
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
                  <p className="text-sm text-muted-foreground">Ngày đến hạn</p>
                  <p className="font-medium">
                    {new Date(workOrder.dueDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Người được giao</p>
                  <p className="font-medium">{workOrder.assignee || 'Chưa phân công'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {new Date(workOrder.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
}
