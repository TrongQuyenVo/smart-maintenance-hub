import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

type ForecastPeriod = '5y' | '10y' | '20y';

interface ForecastData {
  year: string;
  maintenance: number;
  replacement: number;
  energy: number;
  total: number;
}

const generateForecastData = (years: number): ForecastData[] => {
  const currentYear = new Date().getFullYear();
  const data: ForecastData[] = [];
  
  // Base costs (in millions VND)
  let maintenance = 500;
  let replacement = 200;
  let energy = 1200;

  for (let i = 0; i <= years; i++) {
    const yearLabel = `${currentYear + i}`;
    
    // Apply yearly growth/inflation factors
    const maintenanceGrowth = 1 + (Math.random() * 0.05 + 0.02); // 2-7% growth
    const replacementGrowth = i > 3 ? 1 + (Math.random() * 0.1 + 0.05) : 1; // Equipment replacement increases after 3 years
    const energyGrowth = 1 + (Math.random() * 0.03 + 0.01); // 1-4% energy cost growth

    maintenance = Math.round(maintenance * maintenanceGrowth);
    replacement = Math.round(replacement * replacementGrowth);
    energy = Math.round(energy * energyGrowth);

    data.push({
      year: yearLabel,
      maintenance,
      replacement,
      energy,
      total: maintenance + replacement + energy,
    });
  }

  return data;
};

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}B`;
  }
  return `${value}M`;
};

export function CostForecastChart() {
  const [period, setPeriod] = useState<ForecastPeriod>('10y');

  const periodYears: Record<ForecastPeriod, number> = {
    '5y': 5,
    '10y': 10,
    '20y': 20,
  };

  const data = generateForecastData(periodYears[period]);

  const totalCost = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Dự báo chi phí dài hạn</h3>
          <p className="text-sm text-muted-foreground">
            Trend Analysis ngân sách bảo trì, thay thế, năng lượng
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(['5y', '10y', '20y'] as ForecastPeriod[]).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-3',
                period === p && 'bg-background shadow-sm'
              )}
              onClick={() => setPeriod(p)}
            >
              {p === '5y' ? '5 năm' : p === '10y' ? '10 năm' : '20 năm'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <p className="text-xs text-muted-foreground">Bảo trì</p>
          <p className="text-lg font-semibold text-blue-500">
            {formatCurrency(data.reduce((s, d) => s + d.maintenance, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-orange-500/10">
          <p className="text-xs text-muted-foreground">Thay thế</p>
          <p className="text-lg font-semibold text-orange-500">
            {formatCurrency(data.reduce((s, d) => s + d.replacement, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10">
          <p className="text-xs text-muted-foreground">Năng lượng</p>
          <p className="text-lg font-semibold text-green-500">
            {formatCurrency(data.reduce((s, d) => s + d.energy, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10">
          <p className="text-xs text-muted-foreground">Tổng cộng</p>
          <p className="text-lg font-semibold text-purple-500">
            {formatCurrency(totalCost)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReplacement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toLocaleString('vi-VN')} triệu VND`]}
              labelFormatter={(label) => `Năm ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  maintenance: 'Bảo trì',
                  replacement: 'Thay thế',
                  energy: 'Năng lượng',
                };
                return labels[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="maintenance"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorMaintenance)"
            />
            <Area
              type="monotone"
              dataKey="replacement"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#colorReplacement)"
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorEnergy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
