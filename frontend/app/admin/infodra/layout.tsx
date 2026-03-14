'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InfodraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminToken');
    const adminOrg = localStorage.getItem('adminOrg');
    
    if (!isLoggedIn || adminOrg !== 'infodra') {
      router.push('/admin/login');
    }
  }, [router]);

  return <>{children}</>;
}
