import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import { normalizeCategoryName } from '../../data/mockReviews';

type Props = {
  data: any[]; // [{ date: 'Apr 1', overall: 4, cleanliness: 5, ... }, ...]
  allCategories: string[];
  lineColors?: Record<string, string>;
};

const defaultColors: Record<string, string> = {
  overall: '#3B82F6',
  cleanliness: '#10B981',
  communication: '#F59E0B',
  location: '#EF4444',
  value: '#8B5CF6',
  amenities: '#06B6D4',
  respect_house_rules: '#F97316'
};

function mean(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr: number[]) {
  if (!arr.length) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length);
}

const MiniSparkline: React.FC<{ series: { date: string; value: number }[]; color: string; label: string; spike: boolean; latest: number; yMax?: number }> = ({ series, color, label, spike, latest, yMax = 10 }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{latest}</div>
      </div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          {series.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">No data</div>
          ) : (
            <AreaChart data={series} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
              <defs>
                <linearGradient id={`grad-mini-${label}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} padding={{ left: 6, right: 6 }} />
              <YAxis tick={{ fontSize: 10 }} width={48} domain={[0, yMax]} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-mini-${label})`} fillOpacity={1} dot={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      {spike && <div className="mt-3 text-sm text-red-600">Spike detected</div>}
    </div>
  );
};

const SeriesGraph: React.FC<Props> = ({ data, allCategories, lineColors = {} }) => {
  // sanitize
  const sanitized = useMemo(() => data.map(d => ({ ...d })), [data]);

  // build per-category series
  const byCategory = useMemo(() => {
    const out: Record<string, { date: string; value: number }[]> = {};
    allCategories.forEach(cat => (out[cat] = []));
    sanitized.forEach(pt => {
      const date = pt.date || pt.x || '';
      allCategories.forEach(cat => {
        const raw = pt[cat];
        // only include a point for this category if the rating exists
        if (raw !== undefined && raw !== null && !Number.isNaN(Number(raw))) {
          out[cat].push({ date, value: Number(raw) });
        }
      });
    });
    return out;
  }, [sanitized, allCategories]);

  // compute stats (used for spike detection)
  const stats = useMemo(() => {
    const s: Record<string, { mean: number; std: number; latest: number }> = {};
    Object.keys(byCategory).forEach(cat => {
      const arr = byCategory[cat].map(p => p.value);
      const m = mean(arr);
      const sd = stddev(arr);
      const latest = arr.length ? arr[arr.length - 1] : 0;
      s[cat] = { mean: m, std: sd, latest };
    });
    return s;
  }, [byCategory]);

  // Default ordering: Overall first, then the rest in the given order
  const ordered = useMemo(() => {
    const cats = allCategories.filter(c => c !== 'respect_house_rules');
    const rest = cats.filter(c => c !== 'overall');
    const result: string[] = [];
    if (cats.includes('overall')) result.push('overall');
    result.push(...rest);
    return result;
  }, [allCategories]);

  // Map to display labels and skip host-to-guest-only categories like 'respect_house_rules'
  const displayLabel = (cat: string) => {
    if (cat === 'respect_house_rules') return null; // skip host->guest category
    if (cat === 'overall') return 'Overall';
    return normalizeCategoryName(cat);
  };

  const visible = ordered.filter(c => displayLabel(c) !== null);

  return (
    <div>
  {/* simplified: show overall first and then other categories; no controls */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visible.map(cat => {
          const series = byCategory[cat] || [];
          const st = stats[cat] || { mean: 0, std: 0, latest: 0 };
          const spike = st.latest > (st.mean + 2 * st.std);
          const color = lineColors[cat] || defaultColors[cat] || '#3B82F6';
          const label = displayLabel(cat) || cat;
          return (
            <MiniSparkline key={cat} series={series} color={color} label={label} spike={spike} latest={st.latest} yMax={cat === 'overall' ? 5 : 10} />
          );
        })}
      </div>
    </div>
  );
};

export default SeriesGraph;
