import { motion } from 'framer-motion';
import { Target, Users, Zap, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface KPITarget {
  id: string;
  title: string;
  target: string;
  current: number;
  targetValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const kpiTargets: KPITarget[] = [
  {
    id: 'staff',
    title: 'Giảm nhân sự vận hành',
    target: 'Mục tiêu: Giảm 50%',
    current: 35,
    targetValue: 50,
    unit: '%',
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-500',
  },
  {
    id: 'energy',
    title: 'Tiết kiệm chi phí năng lượng',
    target: 'Mục tiêu: Giảm 10%',
    current: 7.5,
    targetValue: 10,
    unit: '%',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500',
  },
  {
    id: 'efficiency',
    title: 'Hiệu suất & tuổi thọ thiết bị',
    target: 'Mục tiêu: Duy trì 90%',
    current: 88,
    targetValue: 90,
    unit: '%',
    icon: <Settings className="w-5 h-5" />,
    color: 'text-green-500',
  },
];

export function KPITargetCard() {
  return (
    <motion.div
      className="glass-card rounded-xl p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        Mục tiêu cốt lõi
      </h3>
      
      <div className="space-y-4">
        {kpiTargets.map((kpi, index) => {
          const progressPercent = (kpi.current / kpi.targetValue) * 100;
          const isAchieved = kpi.current >= kpi.targetValue;
          
          return (
            <motion.div
              key={kpi.id}
              className="p-3 rounded-lg bg-muted/30 space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={kpi.color}>{kpi.icon}</span>
                  <span className="text-sm font-medium">{kpi.title}</span>
                </div>
                <span className={`text-sm font-mono ${isAchieved ? 'text-success' : 'text-warning'}`}>
                  {kpi.current}{kpi.unit}
                </span>
              </div>
              <Progress 
                value={Math.min(progressPercent, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">{kpi.target}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
