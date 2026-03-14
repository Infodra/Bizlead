'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 3000,
    priceDisplay: '₹3,000',
    leads: 500,
    features: ['500 leads/month', 'Advanced filters', 'CSV export'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 9500,
    priceDisplay: '₹9,500',
    leads: 2000,
    features: ['All Starter features', 'Analytics', 'API access', 'Custom segments'],
  },
];

type SignupStep = 'account' | 'payment' | 'confirmation';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const planFromUrl = searchParams.get('plan');
  const isPlanPreselected = !!planFromUrl;
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SignupStep>('account');
  const [selectedPlan, setSelectedPlan] = useState<string>(planFromUrl || 'starter');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    gstin: '',
    terms_accepted: false,
  });

  // Handle plan pre-selection from URL
  useEffect(() => {
    if (planFromUrl) {
      const validPlan = PLANS.find((p) => p.id === planFromUrl);
      if (validPlan) {
        setSelectedPlan(validPlan.id);
        // Start from account step regardless of plan
        setStep('account');
      } else {
        // Invalid plan, redirect to signup without plan
        router.push('/auth/signup');
      }
    }
  }, [planFromUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateAccountForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.company_name ||
      !formData.phone
    ) {
      toast.error('Please fill all fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return false;
    }

    if (!formData.terms_accepted) {
      toast.error('You must accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAccountForm()) {
      return;
    }

    // Determine which plan to use
    const plan = PLANS.find((p) => p.id === selectedPlan);
    
    // All plans require payment - redirect to payment page
    setStep('payment');
  };

  const handleCompleteSignup = async (paymentIntentId?: string) => {
    setLoading(true);
    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      
      const registerPayload: any = {
        full_name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        company_name: formData.company_name,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirm_password,
        terms_accepted: formData.terms_accepted,
        plan_id: selectedPlan,
        plan_price: plan?.price || 0,
      };

      // Include GSTIN if provided
      if (formData.gstin) {
        registerPayload.gstin = formData.gstin;
      }

      // Include payment details
      if (plan?.price && plan.price > 0) {
        registerPayload.payment_intent_id = paymentIntentId;
        // Billing cycle starts immediately for paid plans (no trial)
        registerPayload.billing_start_date = new Date().toISOString();
      }

      const response = await apiClient.post('/api/v1/auth/register', registerPayload);

      const { access_token, user } = response.data;
      login(access_token, user);
      toast.success('Account created successfully!');
      setStep('confirmation');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(message);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (!plan || !plan.price || plan.price === 0) {
        throw new Error('Invalid plan selected for payment');
      }

      // First register the user account
      await handleCompleteSignup();
      
      // Then redirect to payment page with the selected plan
      router.push(`/payment?plan=${selectedPlan}`);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-[#0F172A] rounded-lg shadow-xl p-8 border border-[#1E293B]">
        {/* Progress Indicator - Only Account and Payment */}
        <div className="flex justify-between items-center mb-8">
          <div className={`flex flex-col items-center ${step === 'account' ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'account' || step === 'payment' || step === 'confirmation' ? 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white' : 'bg-[#334155]'}`}>
              1
            </div>
            <span className="text-xs mt-2">Account</span>
          </div>

          <div className="flex-1 h-1 mx-2 bg-[#334155]"></div>

          <div className={`flex flex-col items-center ${step === 'payment' ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' || step === 'confirmation' ? 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white' : 'bg-[#334155]'}`}>
              2
            </div>
            <span className="text-xs mt-2">Payment</span>
          </div>
        </div>

        {/* Step 1: Account Details */}
        {step === 'account' && (
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">Create Account</h2>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  GST Number <span className="text-[#64748B]">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-1 bg-[#1E293B] border border-[#334155] rounded focus:outline-none focus:ring-2 focus:ring-[#60A5FA] cursor-pointer"
                />
                <label className="ml-3 text-sm text-[#CBD5E1]">
                  I agree to the <a href="/terms" className="text-[#60A5FA] hover:text-[#93C5FD] hover:underline">Terms and Conditions</a> and{' '}
                  <a href="/privacy" className="text-[#60A5FA] hover:text-[#93C5FD] hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">Complete Payment</h2>

            {(() => {
              const plan = PLANS.find((p) => p.id === selectedPlan);
              return plan ? (
                <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#CBD5E1]">Plan:</span>
                    <span className="font-semibold text-[#F8FAFC]">{plan.name} - {plan.leads} leads</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#334155] pt-4 mb-4">
                    <span className="text-lg font-semibold text-[#F8FAFC]">Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent">{plan.priceDisplay}/month</span>
                  </div>
                  <div className="bg-[#0F172A] border border-[#475569] rounded p-3 mt-4">
                    <p className="text-xs text-[#CBD5E1]">
                      ⚠️ Billing starts immediately. No trial period for paid plans. You can cancel anytime.
                    </p>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-200">
                💳 Payment Gateway Integration: Stripe/Razorpay is being set up. Billing cycle starts immediately after payment confirmation.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('account')}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome!</h2>
            <p className="text-[#CBD5E1] mb-6">Your account has been created successfully.</p>
            <p className="text-sm text-[#64748B]">Redirecting to dashboard...</p>
          </div>
        )}

        {step !== 'confirmation' && (
          <p className="text-center text-[#CBD5E1] mt-6 text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-[#60A5FA] hover:text-[#93C5FD] hover:underline font-medium">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <SignupContent />
    </Suspense>
  );
}
