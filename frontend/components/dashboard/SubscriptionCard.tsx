'use client';

import { ArrowRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionCardProps {
  planName: string;
  leadsUsed: number;
  planLimit: number;
  nextBillingDate?: string;
  daysRemaining?: number;
}

const PLAN_ORDER = ['Starter', 'Professional', 'Enterprise'];

export default function SubscriptionCard({
  planName = 'Professional',
  leadsUsed = 0,
  planLimit = 2000,
  nextBillingDate,
  daysRemaining,
}: SubscriptionCardProps) {
  const router = useRouter();

  const planPricingMap: Record<string, { price: string; description: string }> = {
    'Starter': { price: '₹3,000', description: 'Starter plan' },
    'Professional': { price: '₹9,500', description: 'Professional plan' },
    'Enterprise': { price: 'Custom', description: 'Enterprise plan' },
  };

  const planInfo = planPricingMap[planName] || planPricingMap['Professional'];
  const currentPlanIndex = PLAN_ORDER.indexOf(planName);
  const nextPlan = currentPlanIndex < PLAN_ORDER.length - 1 ? PLAN_ORDER[currentPlanIndex + 1] : null;
  const isPaidPlan = true;

  const billingDateDisplay = nextBillingDate || '—';
  const daysRemainingDisplay = daysRemaining ?? 0;

  const usagePercent = planLimit > 0 ? (leadsUsed / planLimit) * 100 : 0;

  return (
    <div className="group relative p-6 lg:p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 hover:border-blue-500/50 transition-all duration-300">
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
        <div className="absolute -inset-1/2 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Plan Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">{planName} Plan</h3>
            <div className="space-y-2">
              <div>
                <span className="text-4xl font-bold text-white">{planInfo.price}</span>
                {planName !== 'Enterprise' && <span className="text-slate-400 ml-2">/month</span>}
              </div>
              <p className="text-slate-400 text-sm">
                {planLimit.toLocaleString()} leads per month
              </p>
            </div>

            {/* Billing Info */}
            {isPaidPlan && (
              <div className="pt-4 space-y-2 border-t border-blue-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Next billing date</span>
                  <span className="text-white font-medium">{billingDateDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Days remaining</span>
                  <span className="text-blue-400 font-medium">{daysRemainingDisplay} days</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isPaidPlan && (
                <button
                  onClick={() => router.push('/billing')}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-white border border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew {planName} Plan
                </button>
              )}
              {nextPlan && (
                <button
                  onClick={() => router.push(`/billing`)}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  Upgrade to {nextPlan}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Usage */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Monthly Usage</h4>

            {/* Usage Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Leads Used</span>
                <span className="text-white font-medium">
                  {leadsUsed.toLocaleString()} / {planLimit.toLocaleString()}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-800 border border-blue-500/20 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                    usagePercent > 80
                      ? 'from-red-600 to-red-500'
                      : usagePercent > 50
                      ? 'from-yellow-600 to-amber-500'
                      : 'from-blue-600 to-cyan-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400">
                {usagePercent.toFixed(1)}% of monthly limit • {(
                  planLimit - leadsUsed
                ).toLocaleString()}{' '}
                remaining
              </p>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-300">
                ✨ <span className="font-medium">AI Analysis:</span> You are on track. Monitor usage
                patterns to avoid overage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
