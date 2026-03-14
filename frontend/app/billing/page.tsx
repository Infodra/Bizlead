'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore, useAuthStore } from '@/lib/store';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import { Loader2, Download, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  due_date: string;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹3,000',
    period: '/month',
    leads: 500,
    features: ['500 leads per month', 'Advanced filters', 'CSV export', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '₹9,500',
    period: '/month',
    leads: 2000,
    popular: true,
    features: ['2,000 leads per month', 'Advanced filtering', 'Custom segments', 'API access', 'Priority support', 'Analytics dashboard'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    leads: -1,
    features: ['Unlimited leads', 'Custom AI workflows', 'Dedicated account manager', 'Custom integrations', 'White-label options', 'Real-time data refresh'],
  },
];

const PLAN_ORDER = ['Starter', 'Professional', 'Enterprise'];

export default function BillingPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [userPlan, setUserPlan] = useState('Professional');
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [planLimit, setPlanLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const currentPlanIndex = PLAN_ORDER.indexOf(userPlan);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await apiClient.get('/subscription');
        const sub = response.data;
        setUserPlan(sub.plan_name || 'Professional');
        setLeadsUsed(sub.leads_used || 0);
        setPlanLimit(sub.plan_limit || 50);
      } catch {
        // Fallback to user data or defaults
        const plan = user?.plan || 'Professional';
        setUserPlan(plan);
        const planData = PLANS.find(p => p.name === plan);
        setPlanLimit(planData?.leads || 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    setInvoiceError('');
    try {
      const response = await apiClient.get('/invoices');
      setInvoices(response.data.invoices || []);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      setInvoiceError('Failed to load invoices. Please try again later.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const response = await apiClient.get(`/invoice/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-blue-50 via-white to-slate-50'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-white to-slate-50'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Billing & Subscription
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage your subscription plan and billing information
          </p>
        </div>

        {/* Current Subscription Card */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Current Subscription
          </h2>
          <SubscriptionCard planName={userPlan} leadsUsed={leadsUsed} planLimit={planLimit} />
        </div>

        {/* Pricing Plans Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = userPlan === plan.name;
              const planIndex = PLAN_ORDER.indexOf(plan.name);
              const isUpgrade = planIndex > currentPlanIndex;
              const isDowngrade = planIndex < currentPlanIndex;

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-6 transition-all relative flex flex-col ${
                    isCurrent
                      ? theme === 'dark'
                        ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500'
                        : 'border-blue-400 bg-blue-50 ring-2 ring-blue-400'
                      : theme === 'dark'
                      ? 'border-slate-700 bg-slate-900/50 hover:border-blue-500/40'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current
                    </div>
                  )}

                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, fdx) => (
                      <div key={fdx} className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      if (plan.id === 'enterprise') {
                        router.push('/contact');
                      } else if (!isCurrent) {
                        router.push(`/payment?plan=${plan.id}`);
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? theme === 'dark'
                          ? 'bg-blue-600/30 text-blue-300 cursor-default'
                          : 'bg-blue-100 text-blue-600 cursor-default'
                        : isUpgrade
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
                        : isDowngrade
                        ? theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600'
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? (
                      'Current Plan'
                    ) : plan.id === 'enterprise' ? (
                      <>Contact Sales <ArrowRight className="w-4 h-4" /></>
                    ) : isUpgrade ? (
                      <>Upgrade <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      'Downgrade'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Info */}
        <div
          className={`rounded-lg border p-8 mb-12 ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Billing Email</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {user?.email || '—'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Current Plan</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {userPlan}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div
          className={`rounded-lg border ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="p-8 border-b border-slate-700">
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Invoice History
            </h2>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Download your invoices for your records
            </p>
          </div>

          {loadingInvoices ? (
            <div className="p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading invoices...</p>
              </div>
            </div>
          ) : invoiceError ? (
            <div className="p-8">
              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-red-900/20 border border-red-800'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{invoiceError}</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                No invoices yet. Your invoices will appear here once you make a payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Invoice #
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Date
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Amount
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      GST
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Total
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className={`border-b transition-colors ${
                      theme === 'dark'
                        ? 'border-slate-700 hover:bg-slate-800/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <td className={`px-6 py-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {invoice.invoice_number}
                      </td>
                      <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        ₹{(invoice.amount / 100).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        ₹{(invoice.gst_amount / 100).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-semibold text-blue-600`}>
                        ₹{(invoice.total_amount / 100).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4`}>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          invoice.status === 'PAID'
                            ? theme === 'dark'
                              ? 'bg-green-900/30 text-green-300 border border-green-700'
                              : 'bg-green-100 text-green-800 border border-green-300'
                            : theme === 'dark'
                            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4`}>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                          disabled={downloadingId === invoice.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                            downloadingId === invoice.id
                              ? theme === 'dark'
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {downloadingId === invoice.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
