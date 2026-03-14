'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=database');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Redirecting to leads database...</p>
      </div>
    </div>
  );
}
