'use client';

import { CheckCircle, Zap, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const PLAN_ORDER = ['Starter', 'Professional', 'Enterprise'];

export default function PricingTiers() {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentPlan = user?.plan || 'Professional';
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);

  const getCtaLabel = (planName: string) => {
    if (planName === 'Enterprise') return 'Contact Sales';
    const planIndex = PLAN_ORDER.indexOf(planName);
    if (planName === currentPlan) return 'Current Plan';
    if (planIndex < currentIndex) return 'Downgrade';
    return 'Upgrade';
  };

  const handlePlanClick = (planName: string) => {
    if (planName === 'Enterprise' || planName === currentPlan) return;
    router.push(`/payment?plan=${planName.toLowerCase()}`);
  };

  const plans = [
    {
      name: 'Starter',
      price: '₹3,000',
      period: '/month',
      leads: '500',
      description: 'Perfect for small teams',
      features: [
        'Up to 500 leads/month',
        'Basic filtering',
        'Email support',
        'Standard data refresh',
        '30-day data retention',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '₹9,500',
      period: '/month',
      leads: '2,000',
      description: 'Most popular plan',
      features: [
        'Up to 2,000 leads/month',
        'Advanced filtering',
        'Custom segments',
        'API access',
        'Priority support',
        'Daily data refresh',
        '90-day data retention',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      leads: 'Unlimited',
      description: 'For power users',
      features: [
        'Unlimited leads/month',
        'Custom AI workflows',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'Real-time data refresh',
        'Lifetime data retention',
        'Private AI layer',
      ],
      aiFeatures: [
        'AI Lead Scoring & Prioritization',
        'AI Smart Search Assistant',
        'AI ICP Matching',
        'AI Market Insights',
        'Custom AI Workflow',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Pricing Plans</h2>
        <p className="text-slate-400">Choose the plan that fits your business needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative group rounded-2xl border transition-all duration-300 ${
              plan.highlighted
                ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/40 via-slate-900/20 to-slate-950 scale-105 shadow-2xl shadow-blue-500/20'
                : 'border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/10 to-slate-950 hover:border-blue-500/40'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="p-6 lg:p-8 h-full flex flex-col">
              {/* Header */}
              <div className="space-y-4 border-b border-blue-500/20 pb-6">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
                <div>
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Up to <span className="font-semibold text-blue-300">{plan.leads}</span> leads/month
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(plan.name)}
                disabled={plan.name === currentPlan}
                className={`w-full mt-6 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  plan.name === currentPlan
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/50 hover:from-blue-700 hover:to-cyan-600'
                      : plan.name === 'Enterprise'
                        ? 'border border-blue-500/30 text-blue-300 hover:bg-blue-500/10'
                        : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600'
                }`}
              >
                {getCtaLabel(plan.name)}
              </button>

              {/* Features */}
              <div className="mt-8 space-y-3 flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features</p>
                {plan.features.map((feature, fdx) => (
                  <div key={fdx} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}

                {/* AI Features for Enterprise */}
                {plan.aiFeatures && (
                  <div className="mt-6 pt-6 border-t border-blue-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                        AI-Powered Intelligence
                      </p>
                    </div>
                    {plan.aiFeatures.map((feature, fdx) => (
                      <div key={fdx} className="flex items-start gap-3 ml-1">
                        <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
