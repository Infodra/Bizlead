'use client';

import { AlertCircle, TrendingUp, Zap, BarChart3 } from 'lucide-react';

export default function AIInsightsPanel() {
  const insights = [
    {
      type: 'growth',
      icon: TrendingUp,
      title: 'Growth Opportunity',
      description: 'Tech sector leads increased 23% this week. Consider targeting this segment.',
      color: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      type: 'trend',
      icon: BarChart3,
      title: 'Peak Usage Hours',
      description: '2-4 PM shows highest lead activity. Optimize queries during this window.',
      color: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      type: 'alert',
      icon: Zap,
      title: 'Upgrade Suggestion',
      description: 'Professional plan recommended. Current usage at 79% of limit.',
      color: 'from-yellow-600/20 to-amber-600/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
    },
    {
      type: 'export',
      icon: AlertCircle,
      title: 'Export Activity',
      description: '1.2K leads exported this month. Engagement trending up 15%.',
      color: 'from-purple-600/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="group relative p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col">
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
        <div className="absolute -inset-1/2 bg-gradient-to-r from-purple-600/20 to-pink-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>

        {/* Insights List */}
        <div className="space-y-3 flex-1">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${insight.borderColor} bg-gradient-to-br ${insight.color} hover:border-opacity-100 transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${insight.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{insight.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-4 border-t border-blue-500/20">
          <p className="text-xs text-slate-400">
            AI analysis based on account patterns and market signals
          </p>
        </div>
      </div>
    </div>
  );
}
