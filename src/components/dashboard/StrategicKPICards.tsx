import { Users, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StrategicKPI {
  title: string;
  target: string;
  current: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function StrategicKPICards() {
  const kpis: StrategicKPI[] = [
    {
      title: 'Giảm nhân sự vận hành',
      target: '50%',
      current: 35,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tiết kiệm năng lượng',
      target: '10%',
      current: 7.5,
      icon: <Zap className="w-5 h-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Hiệu suất & tuổi thọ thiết bị',
      target: '90%',
      current: 88,
      icon: <Settings className="w-5 h-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Mục tiêu chiến lược IOC</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg ${kpi.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={kpi.color}>{kpi.icon}</span>
              <span className="text-sm font-medium">{kpi.title}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">{kpi.current}%</span>
              <span className="text-sm text-muted-foreground">/ {kpi.target}</span>
            </div>
            <Progress
              value={(kpi.current / parseFloat(kpi.target)) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {kpi.current >= parseFloat(kpi.target)
                ? '✓ Đạt mục tiêu'
                : `Còn ${(parseFloat(kpi.target) - kpi.current).toFixed(1)}% để đạt mục tiêu`}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
