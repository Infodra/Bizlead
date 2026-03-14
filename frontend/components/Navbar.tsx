'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Logo } from '@/components/Logo';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="md" showText={true} />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-100 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/scraper"
                className="text-gray-100 hover:text-white transition-colors font-medium"
              >
                Business Search
              </Link>
              <Link
                href="/leads"
                className="text-gray-100 hover:text-white transition-colors font-medium"
              >
                My Leads
              </Link>
              <Link
                href="/billing"
                className="text-gray-100 hover:text-white transition-colors font-medium"
              >
                Billing
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-100">
                  {user.first_name} {user.last_name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
