/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockWorkOrders } from '@/data/mockData';

const tbmCount = mockWorkOrders.filter(w => w.source === 'TBM').length;
const cbmCount = mockWorkOrders.filter(w => w.source === 'CBM').length;
const manualCount = mockWorkOrders.filter(w => w.source === 'Manual').length;

const data = [
  { name: 'TBM', value: tbmCount, color: 'hsl(200, 85%, 55%)' },
  { name: 'CBM', value: cbmCount, color: 'hsl(175, 80%, 50%)' },
  { name: 'Thủ công', value: manualCount, color: 'hsl(35, 95%, 55%)' },
];

const legendFormatter = (value: any) => (
  <span className="text-xs sm:text-sm text-foreground">{value}</span>
);

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
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
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
              formatter={legendFormatter}
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
