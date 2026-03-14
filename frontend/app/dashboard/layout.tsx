'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useThemeStore } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import AIChatAssistant from '@/components/dashboard/AIChatAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { theme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuthentication = async () => {
      // First check localStorage directly (faster than waiting for store hydration)
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const localUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (localToken && localUser) {
        // Token and user exist in localStorage
        
        // Ensure store is synced with localStorage
        const storeToken = useAuthStore.getState().token;
        if (!storeToken) {
          // Token in localStorage but not in store, update store
          try {
            const user = JSON.parse(localUser);
            useAuthStore.getState().login(localToken, user);
          } catch (e) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth/login');
            return;
          }
        }
        
        setIsAuthenticated(true);
        setMounted(true);
        setIsChecking(false);
      } else {
        // No token or user in localStorage, redirect to login
        setMounted(true);
        setIsChecking(false);
        router.push('/auth/login');
      }
    };

    checkAuthentication();
  }, [router]);

  // Show loading state while checking authentication
  if (isChecking || !mounted) {
    return (
      <div className={`flex h-screen items-center justify-center ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-white via-slate-50 to-slate-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex h-screen ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white'
        : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900'
    }`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
}
