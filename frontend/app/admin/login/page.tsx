'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'infodra' | 'bizlead'>('infodra');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate credentials based on active tab
    let isValid = false;
    let redirectPath = '';

    if (activeTab === 'infodra') {
      if (userId === 'Infodra' && password === 'Infodra0825#') {
        isValid = true;
        redirectPath = '/admin/infodra';
      }
    } else if (activeTab === 'bizlead') {
      if (userId === 'Infodra_biz' && password === 'Infodrabiz#') {
        isValid = true;
        redirectPath = '/admin/bizlead';
      }
    }

    if (isValid) {
      // Store admin token and org
      localStorage.setItem('adminToken', 'true');
      localStorage.setItem('adminOrg', activeTab);
      localStorage.setItem('adminLoginTime', new Date().toISOString());
      
      // Redirect to respective dashboard
      router.push(redirectPath);
    } else {
      setError('Invalid credentials. Please check your User ID and Password.');
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'infodra' | 'bizlead') => {
    setActiveTab(tab);
    setUserId('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Portal</h1>
          <p className="text-gray-400 text-center mb-8">Access Organization Dashboard</p>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => handleTabChange('infodra')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'infodra'
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-slate-700/40 text-gray-300 border border-slate-600/50 hover:border-blue-500/30'
              }`}
            >
              Infodra
            </button>
            <button
              onClick={() => handleTabChange('bizlead')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'bizlead'
                  ? 'bg-cyan-600 text-white border border-cyan-500'
                  : 'bg-slate-700/40 text-gray-300 border border-slate-600/50 hover:border-cyan-500/30'
              }`}
            >
              BizLead
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Infodra Tab Info */}
            {activeTab === 'infodra' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-200">
                  <span className="font-semibold">Infodra Admin</span>
                  <br />
                  Access the Infodra database management dashboard
                </p>
              </div>
            )}

            {/* BizLead Tab Info */}
            {activeTab === 'bizlead' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-cyan-200">
                  <span className="font-semibold">BizLead Admin</span>
                  <br />
                  Access the BizLead database management dashboard
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* UserId Field */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={activeTab === 'infodra' ? 'Infodra' : 'Infodra_biz'}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition"
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'infodra' ? 'Infodra0825#' : 'Infodrabiz#'}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  activeTab === 'infodra'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50'
                } disabled:cursor-not-allowed`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-blue-900/30 text-center">
            <p className="text-xs text-gray-500">
              Admin Portal - Restricted Access
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-blue-400 hover:text-blue-300 transition text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
