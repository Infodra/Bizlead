"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AboutUsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 to-slate-900/70 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-gray-300 hover:text-white transition">
              Home
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">
              Pricing
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white transition">
              Contact
            </a>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            About BizLead
          </h1>
          <p className="text-xl md:text-2xl text-blue-300 font-semibold mb-6">
            Empowering B2B Growth with Intelligent Lead Discovery
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            BizLead is a B2B lead intelligence platform designed to help sales and marketing teams identify, analyze, and connect with the right business prospects faster and smarter. Our platform enables structured business discovery with clarity, efficiency, and scalability.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-12 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              To simplify B2B prospecting by delivering structured, reliable, and actionable business intelligence that empowers organizations to scale outreach efficiently and confidently.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">What We Do</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Lead Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Structured business contact data designed to support targeted B2B outreach and market expansion strategies.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Filtering & Discovery</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced filtering by industry, geography, and business category to identify relevant decision-makers quickly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Scalable Prospecting Platform</h3>
              <p className="text-gray-400 leading-relaxed">
                Subscription-based SaaS infrastructure built to support growing sales teams and enterprise workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses BizLead Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12">Who Uses BizLead?</h2>
          
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-10 border border-blue-900/30">
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-lg text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                Sales & Business Development Teams
              </li>
              <li className="flex items-center gap-4 text-lg text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                Marketing & Growth Teams
              </li>
              <li className="flex items-center gap-4 text-lg text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                MSMEs & Emerging Enterprises
              </li>
              <li className="flex items-center gap-4 text-lg text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                Enterprise Sales Organizations
              </li>
              <li className="flex items-center gap-4 text-lg text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                Agencies & Consultants
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Our Values</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Value 1 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-10 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">📋</span>
                <h3 className="text-2xl font-bold text-white">Data Responsibility</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                We promote lawful and responsible use of business data for professional outreach.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-10 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">🔒</span>
                <h3 className="text-2xl font-bold text-white">Security & Compliance</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Enterprise-grade safeguards and secure infrastructure practices.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-10 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">💼</span>
                <h3 className="text-2xl font-bold text-white">Transparency</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Clear pricing, defined usage limits, and ethical operational standards.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-10 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">📈</span>
                <h3 className="text-2xl font-bold text-white">Performance</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Focused on measurable B2B growth impact and sales efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>
      </div>

      {/* Developed & Operated By Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Developed & Operated by Infodra Technologies</h2>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">
              BizLead is a product of Infodra Technologies Private Limited, India — a technology-driven organization specializing in AI-powered digital platforms and enterprise systems.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              With over two decades of industry experience across engineering, digital transformation, and scalable technology development, Infodra builds intelligent solutions designed for measurable business impact.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-900/30 rounded-2xl p-16">
            <h2 className="text-5xl font-bold text-white mb-6">Start Building Your Sales Pipeline Today</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join sales and marketing teams using BizLead to identify and connect with the right business prospects.
            </p>
            <button
              onClick={() => router.push('/#pricing')}
              className="px-12 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/about-us" className="hover:text-white transition">About</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/terms" className="hover:text-white transition">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="/" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <p className="text-gray-400 text-sm">
                A product of Infodra Technologies Private Limited
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 BizLead. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
