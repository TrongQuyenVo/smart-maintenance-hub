import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockWorkOrders } from '@/data/mockData';
import { WOStatusBadge } from '@/components/workorder/WOStatusBadge';
import { WOSourceBadge } from '@/components/workorder/WOSourceBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function RecentWorkOrdersTable() {
  const navigate = useNavigate();
  // live clock for relative times
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const recentOrders = mockWorkOrders.slice(0, 20);

  const timeAgo = (iso?: string) => {
    if (!iso) return '-';
    // Only show the date (no time)
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Lệnh công việc gần đây</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/work-orders')}>
          <span className="hidden sm:inline">Xem tất cả</span>
          <ArrowRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {recentOrders.map((wo, index) => (
          <motion.div
            key={wo.id}
            className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer"
            onClick={() => navigate(`/work-orders/${wo.id}`)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-primary text-xs">{wo.id}</span>
              <WOStatusBadge status={wo.status} />
            </div>
            <p className="text-sm font-medium truncate mb-1">{wo.assetName}</p>
            <div className="flex items-center justify-between">
              <WOSourceBadge source={wo.source} />
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{wo.assignee || 'Chưa giao'}</div>
                <div className="text-[10px] text-muted-foreground">{timeAgo(wo.createdAt)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">ID</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Thiết bị</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Nguồn</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Người thực hiện</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((wo, index) => (
              <motion.tr
                key={wo.id}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/work-orders/${wo.id}`)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-3 px-2 font-mono text-primary text-xs">{wo.id}</td>
                <td className="py-3 px-2 truncate max-w-[150px]">{wo.assetName}</td>
                <td className="py-3 px-2"><WOSourceBadge source={wo.source} /></td>
                <td className="py-3 px-2"><WOStatusBadge status={wo.status} /></td>
                <td className="py-3 px-2 text-muted-foreground">{wo.assignee || '-'}</td>
                <td className="py-3 px-2 text-muted-foreground">{timeAgo(wo.createdAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
