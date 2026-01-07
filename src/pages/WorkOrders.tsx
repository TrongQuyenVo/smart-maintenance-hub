import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { mockWorkOrders } from '@/data/mockData';
import { WOSource, WOStatus } from '@/types/maintenance';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function WorkOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<WOSource | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WOStatus | 'all'>('all');

  const filteredOrders = mockWorkOrders.filter(wo => {
    const matchesSearch = 
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(search.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || wo.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;

    return matchesSearch && matchesSource && matchesStatus;
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
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Lệnh công việc</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Quản lý và theo dõi các lệnh bảo trì
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tạo lệnh mới
        </Button>
      </div>

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

        <div className="flex gap-2 sm:gap-4">
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as WOSource | 'all')}>
            <SelectTrigger className="w-[110px] sm:w-[150px] bg-muted/50">
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
            <SelectTrigger className="w-[110px] sm:w-[150px] bg-muted/50">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="open">Đang mở</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="done">Hoàn thành</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
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
