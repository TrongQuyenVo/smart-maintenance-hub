import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockDashboardStats } from '@/data/mockData';

const data = [
  { name: 'TBM', value: mockDashboardStats.tbmCount, color: 'hsl(200, 85%, 55%)' },
  { name: 'CBM', value: mockDashboardStats.cbmCount, color: 'hsl(175, 80%, 50%)' },
  { name: 'Thủ công', value: mockDashboardStats.manualCount, color: 'hsl(35, 95%, 55%)' },
];

export function WOSourceChart() {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Lệnh công việc theo nguồn</h3>
      <div className="h-[200px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs sm:text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
