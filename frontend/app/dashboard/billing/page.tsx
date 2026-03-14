'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, Download, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import PricingTiers from '@/components/dashboard/PricingTiers';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

const PLAN_DETAILS: Record<string, { price: string; leads: string; features: string[] }> = {
  Starter: {
    price: '₹3,000',
    leads: '500',
    features: ['500 leads per month', 'Advanced filters', 'CSV export', 'Email support', 'Standard data refresh'],
  },
  Professional: {
    price: '₹9,500',
    leads: '2,000',
    features: ['2,000 leads per month', 'Advanced filtering', 'API access', 'Custom segments', 'Priority support', 'Daily data refresh'],
  },
  Enterprise: {
    price: 'Custom',
    leads: 'Unlimited',
    features: ['Unlimited leads', 'Custom AI workflows', 'Dedicated account manager', 'Custom integrations', 'White-label options', 'Real-time data refresh'],
  },
};

const PLAN_ORDER = ['Starter', 'Professional', 'Enterprise'];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'methods'>('invoices');
  const { user } = useAuthStore();
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [subscriptionStatus, setSubscriptionStatus] = useState('Active');
  const [nextBillingDate, setNextBillingDate] = useState('—');
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await apiClient.get('/subscription');
        const sub = response.data;
        setCurrentPlan(sub.plan_name || user?.plan || 'Professional');
        setSubscriptionStatus(sub.status || 'Active');
        if (sub.next_billing_date) {
          setNextBillingDate(
            new Date(sub.next_billing_date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })
          );
        }
      } catch {
        setCurrentPlan(user?.plan || 'Professional');
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await apiClient.get('/invoices');
        setInvoices(response.data.invoices || []);
      } catch {
        setInvoices([]);
      }
    };

    fetchSubscription();
    fetchInvoices();
  }, [user]);

  const planInfo = PLAN_DETAILS[currentPlan] || PLAN_DETAILS['Professional'];

  const handleInvoiceDownload = useCallback(async (invoiceId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/bizlead/payments/invoice/${invoiceId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {
      toast.error('Failed to download invoice');
    }
  }, []);
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const nextPlan = currentIndex < PLAN_ORDER.length - 1 ? PLAN_ORDER[currentIndex + 1] : null;
  const isPaidPlan = true;

  return (
    <div className="flex-1 p-4 lg:p-8 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Billing & Payments</h1>
        <p className="text-slate-400">Manage your subscription, invoices, and payment methods</p>
      </div>

      {/* Current Plan Card */}
      <div className="group relative p-6 lg:p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">{currentPlan} Plan</h3>
            <div>
              <span className="text-4xl font-bold text-white">{planInfo.price}</span>
              {currentPlan !== 'Enterprise' && <span className="text-slate-400 ml-2">/month</span>}
            </div>
            <p className="text-slate-400">{planInfo.leads} leads per month</p>

            <div className="pt-4 space-y-2 border-t border-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  {subscriptionStatus}
                </span>
              </div>
              {isPaidPlan && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Next billing</span>
                  <span className="text-white font-medium">{nextBillingDate}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {isPaidPlan && (
                <button
                  onClick={() => window.location.href = `/payment?plan=${currentPlan.toLowerCase()}`}
                  className="px-4 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew Plan
                </button>
              )}
              {nextPlan && (
                <button
                  onClick={() => {
                    const section = document.getElementById('pricing-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 flex items-center justify-center gap-2"
                >
                  Upgrade
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Plan Highlights</h4>
            <ul className="space-y-3">
              {planInfo.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-blue-500/20">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'text-blue-400 border-blue-500'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'methods'
              ? 'text-blue-400 border-blue-500'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Payment Methods
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="group relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 overflow-hidden">
          <div className="p-6 border-b border-blue-500/20">
            <h3 className="text-lg font-semibold text-white">Billing History</h3>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No invoices yet. Your invoices will appear here once you make a payment.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-500/10">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="p-6 hover:bg-blue-500/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{invoice.invoice_number || invoice.plan}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.created_at || invoice.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ₹{((invoice.total_amount || invoice.amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded mt-1">
                        <CheckCircle className="w-3 h-3" />
                        {invoice.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleInvoiceDownload(invoice.id || invoice._id)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-slate-400 hover:text-white"
                      title="Download Invoice"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="group relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>

            <p className="text-slate-400 text-sm mb-4">No payment methods saved yet.</p>

            <button className="w-full px-4 py-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-300 font-medium rounded-lg transition-colors">
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div id="pricing-section">
        <PricingTiers />
      </div>
    </div>
  );
}
