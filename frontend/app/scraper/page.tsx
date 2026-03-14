'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScraperRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=scraper');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-600 font-semibold">Redirecting to Business Search...</p>
      </div>
    </div>
  );
}
