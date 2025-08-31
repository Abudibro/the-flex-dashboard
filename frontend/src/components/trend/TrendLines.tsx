import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Props = {
  data: any[];
  allCategories: string[];
  visibleCategories: Record<string, boolean>;
  lineColors?: Record<string, string>;
};

const TrendLines: React.FC<Props> = ({ data, allCategories, visibleCategories, lineColors = {} }) => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />

          {allCategories.map(category => (
            visibleCategories[category] && (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={lineColors[category] || '#000'}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLines;
