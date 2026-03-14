'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Search, Bell, Menu, ChevronRight, KeyRound, LogOut, UserPen } from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, setUser } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = (displayName.charAt(0) || 'U').toUpperCase();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirst = profileData.firstName.trim();
    const trimmedLast = profileData.lastName.trim();
    if (!trimmedFirst) {
      toast.error('First name is required');
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await apiClient.put('/api/v1/auth/profile', {
        first_name: trimmedFirst,
        last_name: trimmedLast,
      });
      const fullName = res.data.full_name;
      const updatedUser = { ...user, full_name: fullName, name: fullName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      setShowEditProfile(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Generate breadcrumb
  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') {
      return ['Dashboard', 'Overview'];
    }
    if (pathname.includes('/search')) {
      return ['Dashboard', 'Business Search'];
    }
    if (pathname.includes('/database')) {
      return ['Dashboard', 'Database'];
    }
    if (pathname.includes('/crm')) {
      return ['Dashboard', 'CRM Leads'];
    }
    if (pathname.includes('/billing')) {
      return ['Dashboard', 'Billing'];
    }
    return ['Dashboard'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="border-b border-blue-500/20 bg-gradient-to-r from-slate-900/80 via-blue-900/30 to-slate-900/80 backdrop-blur-md">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-blue-500/50" />}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-blue-300 font-medium' : 'text-slate-400'}>
                    {crumb}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Search + Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors">
              <Search className="w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-white placeholder-slate-400 outline-none w-40"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-blue-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-blue-500/30 rounded-lg shadow-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Clear all</button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <p className="text-sm text-white font-medium">New leads available</p>
                      <p className="text-xs text-slate-400 mt-1">250 new verified leads in tech industry</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-colors cursor-pointer">
                      <p className="text-sm text-white font-medium">AI analysis complete</p>
                      <p className="text-xs text-slate-400 mt-1">Smart lead scoring updated</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:border-green-500/50 transition-colors cursor-pointer">
                      <p className="text-sm text-white font-medium">Plan upgrade available</p>
                      <p className="text-xs text-slate-400 mt-1">Professional plan on special offer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle removed: only dark mode available */}

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {avatarLetter}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-white font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 border border-blue-500/30 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        const nameParts = (user?.full_name || '').split(' ');
                        setProfileData({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' });
                        setShowEditProfile(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20 transition-colors rounded"
                    >
                      <UserPen className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowChangePassword(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20 transition-colors rounded"
                    >
                      <KeyRound className="w-4 h-4" />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors rounded"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] rounded-lg shadow-xl p-8 border border-[#1E293B] w-full max-w-md">
            <h2 className="text-xl font-bold text-[#60A5FA] mb-2">Edit Profile</h2>
            <p className="text-[#94A3B8] text-sm mb-6">Update your name displayed across the dashboard.</p>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="Last name"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2 rounded-lg border border-[#334155] text-[#CBD5E1] hover:bg-[#1E293B] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {updatingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] rounded-lg shadow-xl p-8 border border-[#1E293B] w-full max-w-md">
            <h2 className="text-xl font-bold text-[#60A5FA] mb-2">Change Password</h2>
            <p className="text-[#94A3B8] text-sm mb-6">Enter your current password and choose a new one.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 py-2 rounded-lg border border-[#334155] text-[#CBD5E1] hover:bg-[#1E293B] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/50 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </nav>
  );
}
