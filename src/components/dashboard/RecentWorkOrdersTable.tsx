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
  const recentOrders = mockWorkOrders.slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Work Orders</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/work-orders')}>
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">ID</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Asset</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Source</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Assignee</th>
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
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
