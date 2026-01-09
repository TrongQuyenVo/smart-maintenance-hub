/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal, Form, Input as AntInput, Select as AntSelect } from 'antd';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { mockWorkOrders, mockAssets } from '@/data/mockData';
import { WOSource, WOStatus } from '@/types/maintenance';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function WorkOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<WOSource | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WOStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Work orders state (persisted to localStorage)
  const [workOrders, setWorkOrders] = useState(mockWorkOrders);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    const raw = localStorage.getItem('workOrders');
    if (raw) {
      try { setWorkOrders(JSON.parse(raw)); } catch (e) { console.warn('Failed to parse workOrders from localStorage', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
  }, [workOrders]);

  // Get unique assignees for filter
  const assignees = Array.from(new Set(workOrders.map(wo => wo.assignee).filter(Boolean))) as string[];

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch =
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(search.toLowerCase());

    const matchesSource = sourceFilter === 'all' || wo.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || wo.assignee === assigneeFilter;

    return matchesSearch && matchesSource && matchesStatus && matchesPriority && matchesAssignee;
  });

  const priorityColors = {
    low: 'text-muted-foreground',
    medium: 'text-info',
    high: 'text-warning',
    critical: 'text-destructive',
  };

  const priorityLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xl sm:text-2xl font-bold">Lệnh công việc</span>
          <p className="text-sm sm:text-base text-muted-foreground">
            Quản lý và theo dõi các lệnh bảo trì
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tạo lệnh mới
        </Button>
      </div>

      {/* Create Work Order Modal */}
      <Modal
        title="Tạo lệnh công việc mới"
        open={isCreateOpen}
        centered
        onCancel={() => setIsCreateOpen(false)}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => setIsCreateOpen(false)}>Hủy</Button>,
          <Button key="save" onClick={async () => {
            try {
              const values = await createForm.validateFields();
              const asset = mockAssets.find(a => a.id === values.assetId);
              const newWO = {
                id: `WO-${Date.now().toString(36)}`,
                title: values.title,
                assetId: values.assetId,
                assetName: asset ? asset.name : values.assetId,
                source: values.source,
                status: 'open' as WOStatus,
                priority: values.priority,
                createdAt: new Date().toISOString(),
                dueDate: values.dueDate || new Date().toISOString(),
                assignee: values.assignee || '',
                checklist: [],
                notes: values.notes || '',
              };
              setWorkOrders(prev => [newWO, ...prev]);
              createForm.resetFields();
              setIsCreateOpen(false);
            } catch (err) {
              console.warn('Create WO failed', err);
            }
          }}>Tạo</Button>
        ]}
      >
        <Form form={createForm} layout="vertical" initialValues={{ source: 'Manual', priority: 'medium' }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <AntInput />
          </Form.Item>

          <Form.Item name="assetId" label="Thiết bị" rules={[{ required: true, message: 'Chọn thiết bị' }]}>
            <AntSelect placeholder="Chọn thiết bị">
              {mockAssets.map(a => (
                <AntSelect.Option key={a.id} value={a.id}>{a.name}</AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Form.Item name="source" label="Nguồn" rules={[{ required: true }]}>
              <AntSelect>
                <AntSelect.Option value="TBM">TBM</AntSelect.Option>
                <AntSelect.Option value="CBM">CBM</AntSelect.Option>
                <AntSelect.Option value="Manual">Thủ công</AntSelect.Option>
              </AntSelect>
            </Form.Item>
            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}>
              <AntSelect>
                <AntSelect.Option value="low">Thấp</AntSelect.Option>
                <AntSelect.Option value="medium">Trung bình</AntSelect.Option>
                <AntSelect.Option value="high">Cao</AntSelect.Option>
                <AntSelect.Option value="critical">Khẩn cấp</AntSelect.Option>
              </AntSelect>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Form.Item name="dueDate" label="Hạn">
              <AntInput type="date" />
            </Form.Item>

            <Form.Item name="assignee" label="Người thực hiện">
              <AntSelect placeholder="Chọn người thực hiện" allowClear>
                {assignees.length === 0 ? (
                  <AntSelect.Option value="" disabled>Không có người thực hiện</AntSelect.Option>
                ) : (
                  assignees.map(a => (
                    <AntSelect.Option key={a} value={a}>{a}</AntSelect.Option>
                  ))
                )}
              </AntSelect>
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <AntInput.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[250px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo ID, tiêu đề hoặc thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as WOSource | 'all')}>
            <SelectTrigger className="w-full sm:w-[130px] bg-muted/50">
              <SelectValue placeholder="Nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="TBM">TBM</SelectItem>
              <SelectItem value="CBM">CBM</SelectItem>
              <SelectItem value="Manual">Thủ công</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WOStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[130px] bg-muted/50">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="open">Đang mở</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="done">Hoàn thành</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[130px] bg-muted/50">
              <SelectValue placeholder="Ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ưu tiên</SelectItem>
              <SelectItem value="critical">Khẩn cấp</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-muted/50">
              <SelectValue placeholder="Người thực hiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả người thực hiện</SelectItem>
              {assignees.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filteredOrders.map((wo, index) => (
          <motion.div
            key={wo.id}
            className="glass-card rounded-xl p-4 cursor-pointer"
            onClick={() => navigate(`/work-orders/${wo.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-primary text-xs">{wo.id}</span>
              <WOStatusBadge status={wo.status} />
            </div>
            <h3 className="font-medium text-sm mb-2 line-clamp-2">{wo.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{wo.assetName}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WOSourceBadge source={wo.source} />
                <span className={cn('text-xs font-medium', priorityColors[wo.priority])}>
                  {priorityLabels[wo.priority]}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(wo.dueDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Thiết bị</th>
                <th>Nguồn</th>
                <th>Ưu tiên</th>
                <th>Trạng thái</th>
                <th>Hạn</th>
                <th>Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((wo, index) => (
                <motion.tr
                  key={wo.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="font-mono text-primary">{wo.id}</td>
                  <td className="font-medium max-w-[200px] lg:max-w-[300px] truncate">{wo.title}</td>
                  <td className="text-muted-foreground">{wo.assetName}</td>
                  <td><WOSourceBadge source={wo.source} /></td>
                  <td>
                    <span className={cn('capitalize font-medium', priorityColors[wo.priority])}>
                      {priorityLabels[wo.priority]}
                    </span>
                  </td>
                  <td><WOStatusBadge status={wo.status} /></td>
                  <td className="text-muted-foreground">
                    {new Date(wo.dueDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-muted-foreground">{wo.assignee || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy lệnh công việc</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
