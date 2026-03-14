"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: February 14, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            {/* Section 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-3">BizLead ("BizLead", "we", "our", or "us") is a B2B lead intelligence platform operated by Infodra Technologies Private Limited, India.</p>
              <p className="mb-3">This Privacy Policy explains how we collect, use, process, store, and safeguard information when you access or use:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>The BizLead web application</li>
                <li>Associated APIs</li>
                <li>Related services and communications</li>
              </ul>
              <p>By accessing or using BizLead, you agree to the practices described in this Privacy Policy.</p>
            </div>

            {/* Section 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Scope of This Policy</h2>
              <p className="mb-3">This Privacy Policy applies to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Registered users of BizLead</li>
                <li>Website visitors</li>
                <li>Prospective customers</li>
                <li>Business contacts interacting directly with us</li>
              </ul>
              <p>This policy covers personal data we collect directly from users and information processed through our platform.</p>
            </div>

            {/* Section 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">A. Account Information</h3>
                  <p className="mb-2">When you register, we collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Company name</li>
                    <li>Phone number</li>
                    <li>Account credentials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">B. Payment & Billing Information</h3>
                  <p className="mb-2">Payments are processed securely through PCI-DSS compliant third-party payment providers.</p>
                  <p className="mb-2">We may collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 mb-2">
                    <li>Billing name</li>
                    <li>Billing address</li>
                    <li>GST details (if applicable)</li>
                    <li>Transaction reference ID</li>
                  </ul>
                  <p className="text-blue-400 italic">We do not store full credit/debit card details on our servers.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">C. Usage & Technical Data</h3>
                  <p className="mb-2">We automatically collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 mb-2">
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Device type</li>
                    <li>Operating system</li>
                    <li>Log files</li>
                    <li>Search queries</li>
                    <li>Filters applied</li>
                    <li>Export activity</li>
                    <li>API usage logs</li>
                  </ul>
                  <p>This data is used for service security, fraud detection, and performance optimization.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">D. Business Contact Data Available Through BizLead</h3>
                  <p className="mb-2">BizLead provides access to structured business contact information intended for professional B2B use.</p>
                  <p className="mb-2">Such information may include:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 mb-2">
                    <li>Company names</li>
                    <li>Business contact numbers</li>
                    <li>Professional email addresses</li>
                    <li>Business addresses</li>
                    <li>Industry classifications</li>
                  </ul>
                  <p className="mb-2"><strong>Business Data made available through the Service may be derived from publicly available sources, third-party platforms, and automated discovery processes.</strong></p>
                  <p className="mb-2">BizLead does not claim ownership of third-party data and does not represent that it maintains an independently owned master database of all businesses listed.</p>
                  <p className="mb-2">BizLead acts as a platform enabling users to discover and organize publicly available business information.</p>
                  <p className="text-gray-400">Users are responsible for ensuring compliance with applicable communication and data protection laws when using exported data.</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing</h2>
              <p className="mb-3">We process personal data under the following lawful bases:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Performance of a contract (account services & subscriptions)</li>
                <li>Legitimate interests (service improvement & fraud prevention)</li>
                <li>Consent (marketing communications)</li>
                <li>Legal obligations (tax, compliance, regulatory requirements)</li>
              </ul>
              <p className="text-blue-400 italic">Processing is carried out in accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (India), where applicable.</p>
            </div>

            {/* Section 5 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. How We Use Your Information</h2>
              <p className="mb-3">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Provide and maintain BizLead services</li>
                <li>Authenticate users and manage accounts</li>
                <li>Process subscriptions and payments</li>
                <li>Deliver lead intelligence features</li>
                <li>Monitor usage and detect fraud</li>
                <li>Improve platform performance</li>
                <li>Communicate updates and security alerts</li>
                <li>Provide customer support</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p>We may use aggregated and anonymized data for analytics and service improvement.</p>
            </div>

            {/* Section 6 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <p className="mb-3">We retain personal data only for as long as necessary for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Service delivery</li>
                <li>Legal compliance</li>
                <li>Dispute resolution</li>
                <li>Fraud prevention</li>
              </ul>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li><strong>Temporary search results</strong> may be retained for operational purposes for up to 30 days.</li>
                <li><strong>Billing and transaction records</strong> may be retained as required under applicable laws.</li>
              </ul>
              <p>Users may request account deletion at any time by contacting us.</p>
            </div>

            {/* Section 7 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
              <p className="mb-3">We implement commercially reasonable technical and organizational safeguards, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure authentication mechanisms</li>
                <li>Access controls</li>
                <li>Infrastructure-level protections</li>
                <li>Monitoring and audit practices</li>
              </ul>
              <p className="text-blue-400 italic">While we strive to protect your data, no method of transmission or storage is completely secure.</p>
            </div>

            {/* Section 8 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Sharing & Third-Party Processors</h2>
              <p className="mb-3">We may share information with:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Payment processors</li>
                <li>Cloud infrastructure providers</li>
                <li>Analytics providers</li>
                <li>Email service providers</li>
                <li>Legal or regulatory authorities (when required)</li>
              </ul>
              <p className="mb-3">All third-party processors are required to maintain appropriate security safeguards.</p>
              <p className="text-blue-400">We do not sell personal data of registered users.</p>
            </div>

            {/* Section 9 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
              <p className="mb-3">BizLead operates from India and may use cloud infrastructure that stores data in multiple jurisdictions.</p>
              <p>Where cross-border transfers occur, appropriate safeguards are implemented.</p>
            </div>

            {/* Section 10 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">10. Cookies & Tracking Technologies</h2>
              <p className="mb-3">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Maintain sessions</li>
                <li>Improve performance</li>
                <li>Analyze usage</li>
                <li>Enhance user experience</li>
              </ul>
              <p>Users may manage cookie preferences through browser settings.</p>
            </div>

            {/* Section 11 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">11. Your Rights</h2>
              <p className="mb-3">Subject to applicable law, you may have rights to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion</li>
                <li>Restrict processing</li>
                <li>Object to processing</li>
                <li>Receive data in portable format</li>
              </ul>
              <p>Requests may be submitted to the contact details below.</p>
            </div>

            {/* Section 12 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">12. Responsible Use of Business Data</h2>
              <p className="mb-3">BizLead provides access to structured business contact data intended strictly for lawful professional use.</p>
              <p className="mb-3">Users are solely responsible for ensuring compliance with applicable data protection, anti-spam, and marketing regulations.</p>
              <p className="text-blue-400 italic">BizLead does not assume liability for misuse of exported data by users.</p>
            </div>

            {/* Section 13 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">13. Data Review & Removal Requests</h2>
              <p className="mb-3">Businesses or individuals who believe their publicly available contact information is incorrectly listed may request review or removal by contacting:</p>
              <p className="text-blue-400 mb-3">business@infodratechnologies.com</p>
              <p className="text-gray-400">Requests will be reviewed in accordance with applicable laws.</p>
            </div>

            {/* Section 14 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">14. Account Termination</h2>
              <p className="mb-3">We reserve the right to suspend or terminate accounts for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-3">
                <li>Violation of terms</li>
                <li>Fraudulent activity</li>
                <li>Misuse of platform data</li>
                <li>Non-payment</li>
              </ul>
              <p>Certain data may be retained after termination where legally required.</p>
            </div>

            {/* Section 15 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">15. Changes to This Privacy Policy</h2>
              <p className="mb-3">We may update this Privacy Policy periodically.</p>
              <p className="mb-3">Material changes will be reflected by updating the "Last Updated" date.</p>
              <p>Continued use constitutes acceptance.</p>
            </div>

            {/* Section 16 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">16. Contact Us</h2>
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
