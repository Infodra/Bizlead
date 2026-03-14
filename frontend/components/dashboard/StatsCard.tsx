'use client';

import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
}

export default function StatsCard({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  trendLabel = 'from last month',
}: StatsCardProps) {
  const isPositive = trend ? trend > 0 : false;

  return (
    <div className="group relative p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute -inset-1/2 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/30 border border-blue-500/30 group-hover:border-blue-500/50 transition-colors">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          {trend !== undefined && trend !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                isPositive
                  ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                  : 'text-red-400 bg-red-500/10 border border-red-500/30'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          {unit && <span className="text-slate-400 text-sm">{unit}</span>}
        </div>
        {trend !== undefined && (
          <p className="text-xs text-slate-500 mt-2">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}
