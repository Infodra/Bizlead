"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  max_leads: number;
  features: string[];
}

const allPlans: PaymentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 3000,
    period: "/month",
    max_leads: 500,
    features: [
      "500 leads/month",
      "Advanced filters",
      "CSV export",
      "Priority support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 9500,
    period: "/month",
    max_leads: 2000,
    features: [
      "2000 leads/month",
      "Advanced analytics",
      "API access",
      "Custom segments",
    ],
  },
];

export default function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [currentPlanId, setCurrentPlanId] = useState<string>('starter');
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    gstin: "",
    password: "",
    confirmPassword: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");

  // Check if user is logged in
  useEffect(() => {
    if (user) {
      setIsExistingUser(true);
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || "",
        email: user.email || "",
        company: user.company_name || "",
        phone: user.phone || ""
      }));
    } else {
      setIsExistingUser(false);
    }
  }, [user]);

  // Fetch user's current plan only if authenticated with valid token
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      // Only fetch if user is logged in AND has a valid token
      if (!user) {
        return;
      }
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        return;
      }
      
      try {
        const response = await apiClient.get('/api/v1/bizlead/dashboard');
        setCurrentPlanId(response.data.plan_id || 'starter');
      } catch (error: any) {
        // Silently handle errors - default to starter if fetch fails
        // This is expected for unauthenticated users or invalid tokens
        setCurrentPlanId('starter');
      }
    };

    fetchCurrentPlan();
  }, [user]);

  // Set initial selected plan from URL or default
  useEffect(() => {
    const planSlug = searchParams.get("plan");
    if (planSlug) {
      const plan = allPlans.find(p => p.id === planSlug);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams]);

  const handleContinueToDashboard = () => {
    // Store token and user in auth store and localStorage
    login(localStorage.getItem('token') || '', JSON.parse(localStorage.getItem('user') || '{}'));
    router.push("/dashboard");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // Step 1: Create payment order on backend
      const orderResponse = await apiClient.post(
        '/api/v1/bizlead/payments/create-order',
        {
          plan_name: selectedPlan.id,
          email: formData.email,
          full_name: formData.fullName
        }
      );

      const orderData = orderResponse.data;
      const paymentRecordId = orderData.payment_id;

      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.key_id, // Razorpay key from backend
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'BizLead',
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: orderData.order_id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment signature
            const verifyResponse = await apiClient.post(
              '/api/v1/bizlead/payments/verify',
              {
                order_id: orderData.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan_name: selectedPlan.id
              }
            );

            // Step 4: Complete payment and activate subscription
            const completeResponse = await apiClient.post(
              '/api/v1/bizlead/payments/complete',
              {
                order_id: orderData.order_id,
                plan_name: selectedPlan.id,
                payment_record_id: paymentRecordId,
                email: formData.email,
                full_name: formData.fullName,
                password: formData.password
              }
            );

            // Check if subscription was activated or if user needs to login first
            const completeData = completeResponse.data;
            
            if (isExistingUser) {
              // Existing user - subscription should be activated immediately
              const updatedUser = {
                ...user,
                plan: selectedPlan.id
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              login(localStorage.getItem('token') || '', updatedUser);
              setPaymentStatus('success');
              toast.success('Payment successful! Your subscription has been updated.');
              // Redirect to billing after 2 seconds
              setTimeout(() => {
                router.push('/dashboard/billing');
              }, 2000);
            } else if (completeData.requires_auth) {
              // New user - store plan info and redirect to login/signup
              localStorage.setItem('pendingPlan', selectedPlan.id);
              localStorage.setItem('pendingEmail', formData.email);
              setPaymentStatus('success');
              toast.success('Payment successful! Please sign up to activate your subscription.');
              // Redirect to signup after 2 seconds
              setTimeout(() => {
                window.location.href = `/auth/signup?email=${encodeURIComponent(formData.email)}&plan=${selectedPlan.id}`;
              }, 2000);
            } else {
              // Subscription already activated
              const updatedUser = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                plan: selectedPlan.id
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              login(localStorage.getItem('token') || '', updatedUser);
              setPaymentStatus('success');
              toast.success('Payment successful! Subscription activated.');
            }
          } catch (error: any) {
            console.error('Error completing payment:', error);
            setPaymentStatus('error');
            toast.error('Payment completion failed: ' + (error.response?.data?.detail || error.message));
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      setPaymentStatus('error');
      toast.error('Payment processing failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Payment Form */}
        {selectedPlan && (
          <div id="payment-section" className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
                  <h2 className="text-2xl font-bold mb-6" style={{color: '#000000'}}>Order Summary</h2>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm mb-2" style={{color: '#000000'}}>Plan</p>
                    <h3 className="text-xl font-bold mb-4" style={{color: '#000000'}}>{selectedPlan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold" style={{color: '#000000'}}>
                        ₹{selectedPlan.price.toLocaleString()}
                      </span>
                      <span className="ml-2" style={{color: '#111827'}}>{selectedPlan.period}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm mb-4 font-semibold" style={{color: '#000000'}}>Features included:</p>
                    <ul className="space-y-3">
                      {selectedPlan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm" style={{color: '#000000'}}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{color: '#000000'}}>Subtotal:</span>
                      <span className="text-sm" style={{color: '#000000'}}>
                        ₹{selectedPlan.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{color: '#000000'}}>GST (18%):</span>
                      <span className="text-sm" style={{color: '#000000'}}>
                        ₹{Math.round(selectedPlan.price * 0.18).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200">
                      <span className="font-semibold" style={{color: '#000000'}}>Total:</span>
                      <span className="text-2xl font-bold" style={{color: '#000000'}}>
                        ₹{Math.round(selectedPlan.price * 1.18).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-900">Billed monthly. Cancel anytime.</p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-8" style={{color: '#000000'}}>Payment Details</h2>

                  {paymentStatus === "success" ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <svg
                          className="w-16 h-16 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2" style={{color: '#000000'}}>Payment Successful!</h3>
                      <p className="text-gray-900 mb-6">
                        Your payment has been successfully completed.
                      </p>
                      <button
                        onClick={handleContinueToDashboard}
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
                      >
                        Click here to continue to Dashboard
                      </button>
                    </div>
                  ) : paymentStatus === "error" ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center mb-8">
                      <h3 className="text-lg font-bold text-red-900 mb-2">Payment Failed</h3>
                      <p className="text-red-700 mb-4">
                        Unable to process your request. Please try again.
                      </p>
                      <button
                        onClick={() => setPaymentStatus("idle")}
                        className="inline-block px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className={paymentStatus === "success" ? "hidden" : ""}>
                    {/* User Status Notice */}
                    {isExistingUser && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          ✓ Logged in as <strong>{formData.email}</strong>. Renewing current plan.
                        </p>
                      </div>
                    )}

                    {/* Personal Information - Show only for new users */}
                    {!isExistingUser && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#000000'}}>Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                              Company
                            </label>
                            <input
                              type="text"
                              name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>
                  </div>
                      </div>
                    )}

                {/* Account Information - Show only for new users */}
                {!isExistingUser && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{color: '#000000'}}>Create Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* GST Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{color: '#000000'}}>GST Information <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>
                      GST Number (GSTIN)
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      maxLength={15}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">Provide your GSTIN for a GST-compliant invoice</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? "Processing..." : `Pay ₹${selectedPlan.price.toLocaleString()}`}
                </button>

                <p className="text-xs text-center mt-4" style={{color: '#000000'}}>
                  Payments are securely processed by Razorpay. We do not store your card details.
                </p>
              </form>
            </div>

            {/* Billing Terms */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-2" style={{color: '#000000'}}>Billing Information</h3>
                <ul className="text-sm text-gray-900 space-y-2">
                  <li>• Your subscription will renew on the same date each month</li>
                  <li>• You can upgrade, downgrade, or cancel anytime</li>
                  <li>• Changes take effect from the next billing cycle</li>
                  <li>• We accept all major credit and debit cards</li>
                </ul>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </main>
  );
}
