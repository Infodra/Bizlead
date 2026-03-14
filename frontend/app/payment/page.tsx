"use client";

import { Suspense } from "react";
import PaymentPageContent from "./payment-content";

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
      <div className="animate-pulse text-white">Loading payment page...</div>
    </div>
  );
}

