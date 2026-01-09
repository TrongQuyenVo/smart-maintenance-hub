import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

type ForecastPeriod = '5' | '10' | '20';

interface ForecastData {
  year: string;
  maintenance: number;
  replacement: number;
  energy: number;
  total: number;
}

const generateForecastData = (years: number): ForecastData[] => {
  const data: ForecastData[] = [];
  const currentYear = new Date().getFullYear();
  
  // Base costs (in millions VND)
  let maintenanceBase = 500;
  let replacementBase = 200;
  let energyBase = 1200;
  
  for (let i = 0; i < years; i++) {
    // Maintenance increases ~5% per year
    const maintenance = Math.round(maintenanceBase * Math.pow(1.05, i));
    
    // Replacement costs spike every 5 years (major overhauls)
    const isOverhaulYear = i > 0 && i % 5 === 0;
    const replacement = isOverhaulYear 
      ? Math.round(replacementBase * (3 + Math.random())) 
      : Math.round(replacementBase * (0.5 + Math.random() * 0.5));
    
    // Energy costs with optimization (target 10% reduction over time)
    const energySavings = Math.min(0.1, i * 0.01);
    const energy = Math.round(energyBase * (1 - energySavings) * Math.pow(1.03, i));
    
    data.push({
      year: `${currentYear + i}`,
      maintenance,
      replacement,
      energy,
      total: maintenance + replacement + energy,
    });
  }
  
  return data;
};

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('vi-VN')}`;
};

export function CostForecastChart() {
  const [period, setPeriod] = useState<ForecastPeriod>('10');
  const data = generateForecastData(parseInt(period));
  
  const totalCost = data.reduce((sum, d) => sum + d.total, 0);
  const avgYearlyCost = Math.round(totalCost / data.length);

  return (
    <motion.div
      className="glass-card rounded-xl p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Dự báo chi phí vận hành dài hạn
        </h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v) => setPeriod(v as ForecastPeriod)}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 năm</SelectItem>
              <SelectItem value="10">10 năm</SelectItem>
              <SelectItem value="20">20 năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">Tổng chi phí dự kiến</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(totalCost)} <span className="text-xs font-normal">triệu VNĐ</span>
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">Trung bình/năm</p>
          <p className="text-lg font-bold">
            {formatCurrency(avgYearlyCost)} <span className="text-xs font-normal">triệu VNĐ</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReplacement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}`}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  maintenance: 'Bảo trì',
                  replacement: 'Thay thế',
                  energy: 'Năng lượng',
                  total: 'Tổng',
                };
                return [`${formatCurrency(value)} triệu`, labels[name] || name];
              }}
            />
            <Legend 
              formatter={(value) => {
                const labels: Record<string, string> = {
                  maintenance: 'Chi phí bảo trì',
                  replacement: 'Chi phí thay thế',
                  energy: 'Chi phí năng lượng',
                };
                return labels[value] || value;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="maintenance" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorMaintenance)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="replacement" 
              stroke="hsl(var(--warning))" 
              fillOpacity={1} 
              fill="url(#colorReplacement)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="energy" 
              stroke="hsl(var(--success))" 
              fillOpacity={1} 
              fill="url(#colorEnergy)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        * Dự báo dựa trên dữ liệu lịch sử, tuổi thọ thiết bị và kế hoạch bảo trì hiện tại
      </p>
    </motion.div>
  );
}
