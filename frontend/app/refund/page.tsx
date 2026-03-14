"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 to-slate-900/70 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" />
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              💳 Refund Policy
            </h1>
            <p className="text-gray-400">
              Last Updated: February 15, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <p className="mb-3">
                This Refund Policy applies to the BizLead platform operated by Infodra Technologies Private Limited, India.
              </p>
              <p className="mb-3">
                By purchasing a subscription to BizLead, you agree to the terms outlined below.
              </p>
            </div>

            {/* Section 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Subscription-Based Service</h2>
              <p className="mb-3">BizLead operates on a monthly subscription model.</p>
              <p className="mb-3">Access to features, usage limits, data export capabilities, and API access is determined by the selected subscription plan.</p>
              <p>Access to paid plans may follow a demo or onboarding process. Billing begins immediately upon subscription activation.</p>
            </div>

            {/* Section 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Conditional Refund Eligibility (7-Day Policy)</h2>
              <p className="mb-3">BizLead offers a conditional refund policy for new monthly subscriptions.</p>
              <p className="mb-3">A refund request may be considered only if:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>The request is submitted within seven (7) calendar days of the initial payment, AND</li>
                <li>Usage does not exceed ten percent (10%) of the plan's monthly usage limit, AND</li>
                <li>No bulk data export exceeding reasonable evaluation use has occurred, AND</li>
                <li>There is no violation of the Terms of Service.</li>
              </ul>
              <p className="mb-3">Refund eligibility is determined solely at BizLead's discretion.</p>
              <p className="mb-3">Refunds will NOT be granted in cases involving:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Excessive data export</li>
                <li>Misuse of Business Data</li>
                <li>Circumvention of usage limits</li>
                <li>Fraudulent activity</li>
                <li>Repeated refund requests</li>
                <li>Violation of applicable laws</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. Non-Refundable Scenarios</h2>
              <p className="mb-3">Except as provided in Section 2 above, subscription fees are non-refundable.</p>
              <p className="mb-3">No refunds will be provided for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Partial subscription periods</li>
                <li>Unused features</li>
                <li>Unused search limits</li>
                <li>Unused export credits</li>
                <li>Account inactivity</li>
                <li>Failure to cancel before renewal</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Cancellation</h2>
              <p className="mb-3">You may cancel your subscription at any time through your account settings.</p>
              <p className="mb-3">Upon cancellation:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Access continues until the end of the current monthly billing cycle</li>
                <li>The subscription will not auto-renew</li>
                <li>No partial refunds will be issued for the remaining period</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Billing Errors</h2>
              <p className="mb-3">If you believe you were charged in error, you must notify us within seven (7) days of the transaction date.</p>
              <p>We will review verified billing disputes and correct any confirmed errors.</p>
            </div>

            {/* Section 6 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Exceptional Circumstances</h2>
              <p className="mb-3">BizLead may, at its sole discretion, issue refunds in exceptional circumstances.</p>
              <p className="mb-3">Approval of such refunds:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Is not guaranteed</li>
                <li>Does not create an ongoing obligation</li>
                <li>Is evaluated on a case-by-case basis</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. Payment Processing</h2>
              <p className="mb-3">Payments are processed through secure third-party payment providers.</p>
              <p className="mb-3">BizLead does not store full credit/debit card details on its servers.</p>
              <p>Users agree to contact BizLead directly for billing concerns before initiating any chargeback or payment dispute.</p>
            </div>

            {/* Section 8 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. Chargebacks</h2>
              <p className="mb-3">Initiating a chargeback without first contacting BizLead may result in:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Immediate account suspension</li>
                <li>Permanent termination of access</li>
                <li>Restriction from future subscriptions</li>
              </ul>
              <p>We strongly encourage users to contact us to resolve billing concerns promptly.</p>
            </div>

            {/* Section 9 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact for Refund & Billing Queries</h2>
              <div className="bg-slate-900/50 rounded p-4 border border-blue-500/30 space-y-2">
                <p><strong>Infodra Technologies Private Limited</strong></p>
                <p><strong>Country:</strong> India</p>
                <p><strong>Email:</strong> business@infodratechnologies.com</p>
                <p><strong>Website:</strong> <a href="https://app.infodratechnologies.com/bizlead" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">https://app.infodratechnologies.com/bizlead</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-900/50 py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-3">&copy; 2026 BizLead. All rights reserved.</p>
          <p className="text-xs text-gray-500">
            BizLead is intended for professional B2B prospecting and business outreach.
          </p>
        </div>
      </footer>
    </div>
  );
}
