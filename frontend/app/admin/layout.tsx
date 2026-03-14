'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminToken');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  }, [router]);

  return <>{children}</>;
}
