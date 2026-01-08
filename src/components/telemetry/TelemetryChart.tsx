import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateTelemetryData } from '@/data/mockData';
import { MetricType } from '@/types/maintenance';

interface TelemetryChartProps {
  assetId: string;
  metric: MetricType;
  threshold?: number;
  hours?: number;
}

const metricColors: Record<MetricType, string> = {
  temperature: 'hsl(0, 75%, 55%)',
  current: 'hsl(35, 95%, 55%)',
  pressure: 'hsl(200, 85%, 55%)',
  vibration: 'hsl(145, 70%, 50%)',
  humidity: 'hsl(175, 80%, 50%)',
};

export function TelemetryChart({ assetId, metric, threshold, hours = 24 }: TelemetryChartProps) {
  const data = useMemo(() => {
    return generateTelemetryData(assetId, metric, hours).map(d => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [assetId, metric, hours]);

  const unit = data[0]?.unit || '';
  const color = metricColors[metric];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(215, 15%, 55%)"
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(220, 15%, 22%)' }}
          />
          <YAxis
            stroke="hsl(215, 15%, 55%)"
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(220, 15%, 22%)' }}
            unit={unit}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220, 18%, 13%)',
              border: '1px solid hsl(220, 15%, 22%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 95%)',
            }}
            labelStyle={{ color: 'hsl(215, 15%, 55%)' }}
          />
          {threshold && (
            <ReferenceLine
              y={threshold}
              stroke="hsl(0, 75%, 55%)"
              strokeDasharray="5 5"
              label={{
                value: `Threshold: ${threshold}${unit}`,
                fill: 'hsl(0, 75%, 55%)',
                fontSize: 12,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}