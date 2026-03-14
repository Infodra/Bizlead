'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter } from 'lucide-react';

interface AIUsageTrendProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export default function AIUsageTrend({
  data,
  timeRange,
  setTimeRange,
}: AIUsageTrendProps) {
  const timeRangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 6 months', value: '6m' },
  ];

  return (
    <div className="group relative p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 hover:border-blue-500/50 transition-all duration-300">
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
        <div className="absolute -inset-1/2 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Lead Usage Trend Analysis</h3>
            <p className="text-sm text-slate-400">Your lead consumption patterns</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-blue-500/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94A3B8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F8FAFC' }}
              formatter={(value) => [`${value} leads`, 'Usage']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#06B6D4', r: 5 }}
              activeDot={{ r: 7 }}
              fillOpacity={1}
              fill="url(#colorValue)"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
