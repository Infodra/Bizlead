'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BizleadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminOrg = localStorage.getItem('adminOrg');

    if (!adminToken || adminOrg !== 'bizlead') {
      router.push('/admin/login');
    }
  }, [router]);

  return <>{children}</>;
}
