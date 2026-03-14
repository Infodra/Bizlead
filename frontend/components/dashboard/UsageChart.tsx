'use client';

interface UsageChartProps {
  data?: Array<{
    name: string;
    value: number;
  }>;
}

export default function UsageChart({ data = [] }: UsageChartProps) {
  // Mock data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Monday', value: 24 },
    { name: 'Tuesday', value: 13 },
    { name: 'Wednesday', value: 20 },
    { name: 'Thursday', value: 18 },
    { name: 'Friday', value: 30 },
    { name: 'Saturday', value: 25 },
    { name: 'Sunday', value: 20 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-gradient-to-br from-[#162338] to-[#0B1220] rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-bold text-white mb-6">Lead Usage Chart</h3>

      <div className="space-y-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">{item.name}</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-[#0B1220] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm text-[#94A3B8]">
          Total Usage: <span className="text-white font-semibold">{chartData.reduce((a, b) => a + b.value, 0)}</span>
        </p>
      </div>
    </div>
  );
}
