'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Always authenticate via API to get a real JWT token
      console.log('🔄 Attempting API login for:', formData.email);
      try {
        const response = await apiClient.post('/api/v1/auth/login', formData);
        if (response.data?.access_token && response.data?.user) {
          console.log('✅ API login successful');
          
          const token = response.data.access_token;
          const user = response.data.user;
          
          // Store in localStorage first
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          // Update store
          login(token, user);
          
          // Store user for future logins (for reference only, always use API)
          const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
          registeredUsers[formData.email.toLowerCase()] = {
            ...user,
            token: token,
            password: formData.password,
          };
          localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
          
          toast.success('Login successful!');
          
          // Ensure localStorage is persisted before redirect
          await new Promise(resolve => setTimeout(resolve, 100));
          router.push('/dashboard');
          return;
        }
      } catch (apiError: any) {
        console.error('❌ API login error caught:', {
          status: apiError?.response?.status,
          statusText: apiError?.response?.statusText,
          message: apiError?.message,
          data: apiError?.response?.data,
          code: apiError?.code,
          fullError: apiError,
        });
        
        // Handle 402 Payment Required - user needs to complete payment
        if (apiError?.response?.status === 402) {
          const errorMessage = apiError?.response?.data?.detail || 'Complete payment to activate your account';
          console.log('🔐 Payment Required - showing error:', errorMessage);
          toast.error(errorMessage);
          setLoading(false);
          await new Promise(resolve => setTimeout(resolve, 2000));
          router.push('/pricing');
          return;
        }
        
        // Check if it's a 401 error (invalid credentials)
        if (apiError?.response?.status === 401) {
          toast.error('Invalid email or password');
          setLoading(false);
          return;
        }
        
        // Handle other HTTP errors
        if (apiError?.response?.status) {
          console.error(`⚠️ API request failed with status ${apiError.response.status}:`, apiError.response.data);
          toast.error(apiError?.response?.data?.detail || 'Login failed. Please try again.');
          setLoading(false);
          return;
        }
        
        // Handle network errors (CORS, timeout, server not responding, etc.)
        if (!apiError?.response) {
          console.error('🔌 Network error - Backend may not be running:', {
            message: apiError?.message,
            code: apiError?.code,
          });
          toast.error('Cannot reach server. Please try again later.');
          setLoading(false);
          return;
        }
      }

      // NO fallback - payment is required. Do NOT create test tokens
      toast.error('Account not found. Please register and complete payment.');
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Unexpected login error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email');
      return;
    }
    setForgotLoading(true);
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email: forgotEmail });
      toast.success('A new password has been sent to your email');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to reset password. Please try again.';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">💡 New Users:</span> Complete payment via our pricing page to activate your account
          </p>
        </div>

        <div className="bg-[#0F172A] rounded-lg shadow-xl p-8 border border-[#1E293B]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-3xl font-bold text-[#60A5FA]">BizLead</h1>
            <p className="text-[#CBD5E1] mt-2">Lead Automation Tool</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotEmail(formData.email);
              }}
              className="text-sm text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] rounded-lg shadow-xl p-8 border border-[#1E293B] w-full max-w-md">
            <h2 className="text-xl font-bold text-[#60A5FA] mb-2">Reset Password</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Enter your registered email address. We&apos;ll send a new password to your inbox.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                  }}
                  className="flex-1 py-2 rounded-lg border border-[#334155] text-[#CBD5E1] hover:bg-[#1E293B] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
