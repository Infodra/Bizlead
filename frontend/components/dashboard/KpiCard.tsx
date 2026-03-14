'use client';

import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  trendLabel?: string;
}

export default function KpiCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend = 0,
  trendLabel = '',
}: KpiCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-gradient-to-br from-[#162338] to-[#0B1220] rounded-lg border border-white/10 p-6 hover:border-blue-500/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <h3 className="text-[#94A3B8] text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-[#64748B]">{subtitle}</p>
      {trendLabel && <p className="text-xs text-[#64748B] mt-1">{trendLabel}</p>}
    </div>
  );
}
