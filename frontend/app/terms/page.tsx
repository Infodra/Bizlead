"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-gray-400">
              Last updated: February 14, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <p className="mb-3">These Terms of Service ("Terms") govern your access to and use of the BizLead platform ("Service"), operated by Infodra Technologies Private Limited, India ("BizLead", "we", "our", or "us").</p>
              <p className="mb-3">By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must not use the Service.</p>
            </div>

            {/* Section 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Definitions</h2>
              <ul className="space-y-2 text-gray-300">
                <li><strong className="text-blue-400">Service</strong> means the BizLead web application, APIs, dashboards, tools, and related features.</li>
                <li><strong className="text-blue-400">User</strong> means any individual or entity accessing the Service.</li>
                <li><strong className="text-blue-400">Subscription</strong> means a paid plan providing access to specific features and usage limits.</li>
                <li><strong className="text-blue-400">Business Data</strong> means structured business contact information made available through the Service.</li>
                <li><strong className="text-blue-400">Content</strong> means software, design, database structures, text, graphics, platform architecture, and related materials.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <ul className="space-y-2 text-gray-300">
                <li>You must be at least 18 years old and legally capable of entering into binding agreements.</li>
                <li>If you use the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. License to Use the Service</h2>
              <p className="mb-3">Subject to these Terms and payment of applicable fees, BizLead grants you a:</p>
              <ul className="space-y-1 text-gray-300 mb-3">
                <li>• Limited</li>
                <li>• Non-exclusive</li>
                <li>• Non-transferable</li>
                <li>• Non-sublicensable</li>
              </ul>
              <p className="mb-3">license to access and use the Service for lawful internal business purposes only.</p>
              <p className="mb-3"><strong className="text-blue-400">No ownership rights are transferred.</strong></p>
              <p className="text-gray-400">The license granted under these Terms does not transfer ownership of Business Data or grant rights to create independent commercial databases derived from the Service.</p>
            </div>

            {/* Section 4 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription & Payment Terms</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">4.1 Subscription Plans</h3>
                <p className="mb-2">BizLead offers multiple subscription plans with defined:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Usage limits</li>
                  <li>Lead export limits</li>
                  <li>API access limits</li>
                  <li>Feature access</li>
                </ul>
                <p className="mt-2 text-gray-400">Plan details are available on the pricing page and may be updated periodically.</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">4.2 Fees</h3>
                <p className="mb-2">You agree to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Pay all applicable subscription fees</li>
                  <li>Provide accurate billing information</li>
                  <li>Authorize recurring payments (where applicable)</li>
                </ul>
                <p className="mt-2 text-blue-400 italic">All fees are exclusive of taxes. Applicable GST or other taxes will be added as required by law.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">4.3 Refund Policy</h3>
                <p className="mb-2">Paid subscriptions may be eligible for a conditional refund within seven (7) days of initial payment, provided that usage does not exceed ten percent (10%) of the plan's monthly usage limit.</p>
                <p className="mb-2">Refund eligibility is determined solely at BizLead's discretion.</p>
                <p className="mb-2">Refunds will not be granted in cases involving:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Excessive data export</li>
                  <li>Abuse of usage limits</li>
                  <li>Violation of these Terms</li>
                  <li>Misuse of Business Data</li>
                </ul>
                <p className="mt-2 text-gray-400">Except as stated above, subscription fees are non-refundable.</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use Policy</h2>
              <p className="mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Use the Service for unlawful purposes</li>
                <li>Send spam or unsolicited mass communications</li>
                <li>Violate applicable data protection, anti-spam, or marketing laws</li>
                <li>Harass, threaten, or mislead individuals or businesses</li>
                <li>Resell, redistribute, sublicense, or commercially exploit Business Data</li>
                <li>Build, enhance, or contribute to a competing database</li>
                <li>Reverse engineer, decompile, or extract source code</li>
                <li>Circumvent usage limits or rate limits</li>
                <li>Use bots or automation beyond permitted API usage</li>
                <li>Attempt unauthorized access to systems</li>
              </ul>
              <p className="text-red-400 italic">Violation may result in immediate suspension or termination.</p>
            </div>

            {/* Section 6 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Business Data Usage Restrictions</h2>
              <p className="mb-3">BizLead provides Business Data for lawful B2B purposes only.</p>
              <p className="mb-3">Users must:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Independently verify data accuracy</li>
                <li>Comply with applicable marketing, anti-spam, and communication laws</li>
                <li>Respect opt-out requests</li>
                <li>Avoid unlawful solicitation</li>
              </ul>
              <p className="mb-3"><strong className="text-blue-400">BizLead does not guarantee 100% accuracy of Business Data.</strong></p>
              <p className="mb-3"><strong className="text-blue-400">Users are solely responsible for how Business Data is used after export. BizLead shall not be liable for any claims, penalties, or damages arising from user misuse.</strong></p>
              <p className="mb-3"><strong className="text-blue-400">BizLead does not endorse, verify, or guarantee the legitimacy of any company or contact listed within the Service.</strong></p>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">6.1 Data Sources & Nature of Business Data</h3>
                <p className="mb-3">Business Data made available through the Service may be derived from publicly available sources, third-party platforms, and automated discovery processes.</p>
                <p className="mb-3">BizLead does not claim ownership of third-party data and does not represent that it maintains an independently owned master database of all businesses listed.</p>
                <p className="mb-3">BizLead provides tools that enable users to discover and organize publicly available business information for lawful B2B purposes.</p>
                <p className="text-gray-400">Certain data elements may be subject to third-party platform terms and policies. Users agree that their use of the Service shall not violate any applicable third-party terms.</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. API Usage</h2>
              <p className="mb-3">If API access is provided:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>API keys are confidential</li>
                <li>Rate limits apply</li>
                <li>Excessive usage may result in throttling</li>
                <li>Automated scraping beyond limits is prohibited</li>
              </ul>
              <p className="text-blue-400">BizLead may revoke API access at any time for misuse.</p>
            </div>

            {/* Section 8 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
              <p className="mb-3">All rights, title, and interest in the Service, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Software</li>
                <li>Databases</li>
                <li>Platform architecture</li>
                <li>Branding</li>
                <li>Trademarks</li>
              </ul>
              <p className="mb-3">remain the exclusive property of BizLead.</p>
              <p className="text-blue-400">No rights are granted except as explicitly stated.</p>
            </div>

            {/* Section 9 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
              <p className="mb-3">The Service is provided "AS IS" and "AS AVAILABLE."</p>
              <p className="mb-3">BizLead disclaims all warranties, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy of Business Data</li>
                <li>Continuous or error-free operation</li>
              </ul>
              <p className="text-blue-400">You assume full responsibility for business decisions made using the Service.</p>
            </div>

            {/* Section 10 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p className="mb-3">To the maximum extent permitted by law, BizLead shall not be liable for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Indirect damages</li>
                <li>Loss of profits</li>
                <li>Loss of business opportunity</li>
                <li>Loss of goodwill</li>
                <li>Loss of data</li>
              </ul>
              <p className="text-blue-400">Total liability shall not exceed the total subscription fees paid by you in the preceding twelve (12) months.</p>
            </div>

            {/* Section 11 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
              <p className="mb-3">You agree to indemnify and hold harmless BizLead, its directors, employees, and affiliates from any claims, damages, liabilities, or expenses arising from:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Your misuse of the Service</li>
                <li>Violation of applicable laws</li>
                <li>Unlawful use of Business Data</li>
                <li>Breach of these Terms</li>
              </ul>
            </div>

            {/* Section 12 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">12. Suspension & Termination</h2>
              <p className="mb-3">BizLead may suspend or terminate access:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>For violation of these Terms</li>
                <li>For non-payment</li>
                <li>For suspected fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mb-3">Upon termination:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Access rights cease immediately</li>
                <li>No refund will be issued unless required by law</li>
                <li>Certain obligations survive termination</li>
              </ul>
            </div>

            {/* Section 13 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">13. Data Protection</h2>
              <p className="mb-3">Your use of the Service is governed by our Privacy Policy.</p>
              <p className="text-gray-300">Users remain responsible for compliance with applicable data protection and communication laws, including India's Digital Personal Data Protection Act, 2023 (where applicable).</p>
            </div>

            {/* Section 14 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">14. Modifications to the Service</h2>
              <p className="mb-3">BizLead may:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Modify features</li>
                <li>Change pricing (changes apply to future billing cycles only)</li>
                <li>Update usage limits</li>
                <li>Discontinue parts of the Service</li>
              </ul>
              <p className="mb-3">We may update these Terms periodically. Continued use constitutes acceptance.</p>
            </div>

            {/* Section 14A */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">14A. Data Removal Requests</h2>
              <p className="mb-3">BizLead provides mechanisms for businesses or individuals to request review or removal of publicly available contact information from the Service.</p>
              <p className="mb-3">Requests may be submitted to:</p>
              <p className="text-blue-400 mb-3">business@infodratechnologies.com</p>
              <p className="text-gray-400">Requests will be reviewed in accordance with applicable laws.</p>
            </div>

            {/* Section 15 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">15. Governing Law & Jurisdiction</h2>
              <ul className="space-y-2 text-gray-300">
                <li>These Terms are governed by the laws of India.</li>
                <li>You agree to exclusive jurisdiction of the courts located in India.</li>
              </ul>
            </div>

            {/* Section 16 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">16. Force Majeure</h2>
              <p className="text-gray-300">BizLead shall not be liable for delays or failure due to events beyond reasonable control, including natural disasters, cyberattacks, government actions, or infrastructure failures.</p>
            </div>

            {/* Section 17 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">17. No Partnership or Agency</h2>
              <p className="text-gray-300">Nothing in these Terms creates any partnership, joint venture, agency, employment relationship, or legal relationship between BizLead and the User. You are not authorized to represent or bind BizLead.</p>
            </div>

            {/* Section 18 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">18. Entire Agreement</h2>
              <p className="text-gray-300">These Terms, together with the Privacy Policy, constitute the entire agreement between you and BizLead.</p>
            </div>

            {/* Section 19 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">19. Contact Information</h2>
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
