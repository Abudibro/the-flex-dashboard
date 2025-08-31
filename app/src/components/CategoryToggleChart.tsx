import React, { useState } from 'react';
import BigTrendChart from './BigTrendChart';

const CATEGORY_OPTIONS = [
  { key: 'overall', label: 'Overall' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
];

interface Props {
  chartData: any[];
  lineColors: Record<string, string>;
}

const CategoryToggleChart: React.FC<Props> = ({ chartData, lineColors }) => {
  const [selected, setSelected] = useState('overall');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {CATEGORY_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`px-4 py-2 rounded font-semibold border transition-colors duration-150 ${selected === opt.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
            onClick={() => setSelected(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <BigTrendChart
        data={chartData}
        category={selected}
        color={lineColors[selected as keyof typeof lineColors] || '#3B82F6'}
        label={CATEGORY_OPTIONS.find(opt => opt.key === selected)?.label}
      />
    </div>
  );
};

export default CategoryToggleChart;