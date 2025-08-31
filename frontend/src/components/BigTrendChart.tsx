import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: any[];
  category: string;
  color: string;
  height?: number;
  label?: string;
}

const BigTrendChart: React.FC<Props> = ({ data, category, color, height = 340, label }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {label && <h4 className="text-lg font-semibold mb-2">{label}</h4>}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} width={40} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey={category} stroke={color} fill={`url(#color-${category})`} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BigTrendChart;
