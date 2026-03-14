"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Logo } from "@/components/Logo";
import { ChevronLeft, ChevronRight, MessageCircle, Menu, X } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const testimonials = [
    {
      id: 1,
      review: "BizLead is one of the most efficient B2B lead generation tools we've used. The platform helps us identify verified business contacts quickly and reduces prospecting time significantly. The advanced filtering and structured data make it easy to target the right decision-makers across industries. It has improved our outreach efficiency and conversion rate.",
      name: "VijayaKumar S",
      designation: "Sales & Marketing Manager",
      company: "ADD Corp Steel Solutions",
      initials: "VS"
    },
    {
      id: 2,
      review: "As a marketing head in the logistics sector, finding accurate business leads is critical. BizLead provides reliable, structured contact data that supports targeted B2B marketing campaigns. The platform is fast, easy to use, and helps our team generate qualified leads consistently. It's a powerful tool for scaling outbound marketing.",
      name: "Palanisamy Chandran",
      designation: "Head – Marketing",
      company: "SPC Logistic",
      initials: "PC"
    },
    {
      id: 3,
      review: "BizLead stands out as a professional lead intelligence platform. The ability to filter companies by industry and location gives us precise targeting capabilities. It has significantly streamlined our business development efforts and improved our sales pipeline quality. A highly recommended solution for B2B growth teams.",
      name: "Kathiravan M",
      designation: "Senior Manager",
      company: "Techiwork Integrated Solutions",
      initials: "KM"
    },
    {
      id: 4,
      review: "BizLead helped us identify builders and commercial project owners within minutes. The advanced filtering options allowed us to target key decision-makers directly, significantly improving our B2B outreach efficiency. It's a powerful lead generation platform for growing businesses.",
      name: "K Gunasekar",
      designation: "Founder",
      company: "Nethra Interiors",
      initials: "GI"
    }
  ];

  // Autoplay testimonial slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 to-slate-900/70 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-t border-slate-700/50 px-4 py-4 space-y-3">
            <a href="/" className="block text-gray-300 hover:text-white transition py-2">
              Home
            </a>
            <a href="#pricing" className="block text-gray-300 hover:text-white transition py-2" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            <a href="/contact" className="block text-gray-300 hover:text-white transition py-2">
              Contact
            </a>
            <button
              onClick={() => {
                router.push('/auth/login');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight whitespace-nowrap">
            One Search.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Complete Leads.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-6 font-medium">
            Find verified B2B business leads across India in seconds.{" "}
            <br className="hidden md:block" />
            Search by location, industry, or keywords and discover publicly available business contact information instantly.
          </p>
          
          {/* Key Features Bullets */}
          <div className="flex gap-6 justify-center mb-10 flex-wrap">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-blue-400 font-bold">•</span>
              <span className="text-lg">Smart Filtering</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-blue-400 font-bold">•</span>
              <span className="text-lg">Fast Search</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-blue-400 font-bold">•</span>
              <span className="text-lg">Business-Ready Data</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-blue-400 font-bold">•</span>
              <span className="text-lg">AI-Powered Intelligence</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <button
              onClick={() => {
                const element = document.getElementById('pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
            >
              View Pricing
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="border-2 border-blue-400 text-blue-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-500/10 transition"
            >
              Book Live Demo
            </button>
          </div>

          {/* Micro Trust Line */}
          <div className="flex gap-6 justify-center flex-wrap text-sm text-gray-400 text-center">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">✔</span>
              <span>No long-term contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">✔</span>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">✔</span>
              <span>GST invoice available</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-16 leading-tight text-center">
            How BizLead Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-500 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Search Businesses</h3>
              <p className="text-gray-400 leading-relaxed">Search by location, industry, or keywords to discover relevant companies across India that match your business needs.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-orange-500 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Filter & Refine</h3>
              <p className="text-gray-400 leading-relaxed">Apply advanced filters to narrow results based on specific business criteria, company size, revenue, and industry segments.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-cyan-500 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Download & Connect</h3>
              <p className="text-gray-400 leading-relaxed">Export structured lead data in multiple formats and start outreach immediately with verified contact information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose" className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-16 leading-tight text-center">
            Why Leaders Choose BizLead
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 - Verified Business Data */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-blue-500/40 group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Verified Business Contacts Across India</h3>
              <p className="text-gray-400 leading-relaxed">Continuously updated database of verified B2B business contacts across India with reliable contact information.</p>
            </div>

            {/* Card 2 - Smart Search */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-xl flex items-center justify-center border border-yellow-500/40 group-hover:border-yellow-500 group-hover:shadow-lg group-hover:shadow-yellow-500/30 transition-all duration-300 mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">High Confidence Lead Matching</h3>
              <p className="text-gray-400 leading-relaxed">Multi-source business intelligence ensures you connect with the right decision-makers quickly and reliably.</p>
            </div>

            {/* Card 3 - Structured Data */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-blue-500/40 group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 mb-6">
                <span className="text-4xl">📧</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Reliable & Structured Data</h3>
              <p className="text-gray-400 leading-relaxed">Email addresses, phone numbers, and company information structured for seamless integration into your sales workflow.</p>
            </div>
          </div>

          {/* Stats Section - Updated with Safer Claims */}
          <div className="mt-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-blue-900/30 hover:border-blue-500/60 hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-900/50 transition-all duration-300 cursor-pointer">
                <p className="text-sm text-blue-300 font-semibold mb-2">Continuously Updated</p>
                <p className="text-2xl font-bold !text-blue-500 mb-2">Millions of Contacts</p>
                <p className="text-lg text-white font-semibold mt-2">Verified Business Data</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-blue-900/30 hover:border-blue-500/60 hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-900/50 transition-all duration-300 cursor-pointer">
                <p className="text-sm text-blue-300 font-semibold mb-2">Data Quality</p>
                <p className="text-4xl font-bold !text-blue-500">High</p>
                <p className="text-lg text-white font-semibold mt-2">Multi-Source Verified</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-blue-900/30 hover:border-blue-500/60 hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-900/50 transition-all duration-300 cursor-pointer">
                <p className="text-sm text-blue-300 font-semibold mb-2">Search Speed</p>
                <p className="text-4xl font-bold !text-blue-500">&lt;2s</p>
                <p className="text-lg text-white font-semibold mt-2">Instant Results</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="trust" className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-12 leading-tight text-center">
            Enterprise-Grade Security & Compliance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Infrastructure</h3>
              <p className="text-gray-400">Secure infrastructure and encrypted data handling to protect your business intelligence and customer information.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Business-Focused Intelligence</h3>
              <p className="text-gray-400">Business-focused contact intelligence designed for professional prospecting and market research.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-white mb-3">Compliance-Aware</h3>
              <p className="text-gray-400">GDPR-aware data handling practices and compliance with international data protection standards.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-blue-500/60 transition-all duration-300">
              <div className="text-3xl mb-4">✋</div>
              <h3 className="text-xl font-bold text-white mb-3">Transparency & Support</h3>
              <p className="text-gray-400">Opt-out and support mechanisms available. Contact our team anytime for compliance questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Sales & Marketing <br className="hidden sm:block" />
              Leaders Across India
            </h2>
            <p className="text-gray-400 text-lg">
              Helping growth teams generate verified B2B leads faster and smarter.
            </p>
          </div>
          
          {/* Testimonial Slider */}
          <div className="relative max-w-3xl mx-auto">
            {/* Testimonials Container */}
            <div className="relative h-96 overflow-hidden">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    idx === currentTestimonial ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 md:p-10 border border-blue-900/30 h-full flex flex-col justify-between hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                    {/* Star Rating */}
                    <div>
                      <div className="flex items-center gap-1 mb-4">
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-yellow-400 text-xl">★</span>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-white text-lg leading-relaxed mb-8">
                        "{testimonial.review}"
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-700/50">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {testimonial.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-base">{testimonial.name}</p>
                        <p className="text-gray-400 text-sm">{testimonial.designation}</p>
                        <p className="text-blue-400 text-sm font-medium">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:-translate-x-20 bg-blue-600/80 hover:bg-blue-500 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-20 bg-blue-600/80 hover:bg-blue-500 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentTestimonial
                      ? 'bg-blue-500 w-8'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-900/30 rounded-2xl p-16">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Scale Your Lead Generation?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Start your journey to smarter B2B prospecting with BizLead's verified business leads and advanced filtering capabilities.
            </p>
            <p className="text-white text-lg font-semibold">
              Contact sales to get started
            </p>
          </div>
        </div>
      </section>

      {/* Who is BizLead For Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
            Who Is BizLead For?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Perfect For */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-green-500/60 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-green-400 text-3xl">✓</span>
                Perfect For
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Professional B2B sales teams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Marketing agencies and marketing teams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Business development managers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold mt-1">✓</span>
                  <span>Growth and expansion specialists</span>
                </li>
              </ul>
            </div>

            {/* Not Recommended For */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl p-8 border border-blue-900/30 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-red-400 text-3xl">✕</span>
                Not Recommended For
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-1">✕</span>
                  <span>Mass spam or unsolicited bulk campaigns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-1">✕</span>
                  <span>Personal data harvesting or reselling</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-1">✕</span>
                  <span>Non-compliant usage of contact data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-1">✕</span>
                  <span>Activities violating data protection laws</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-6">
              Choose the plan that's right for your business. Scale as you grow.
            </p>
            <div className="flex gap-6 justify-center flex-wrap mb-8">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold text-xl">•</span>
                <span>GST excluded</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold text-xl">•</span>
                <span>7-Day Conditional Refund</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Starter',
                monthlyPrice: '₹3,000',
                annualPrice: '₹36,000',
                leads: '500 leads/month',
                features: [
                  { name: '500 leads/month', included: true },
                  { name: 'Advanced filters', included: true },
                  { name: 'CSV export', included: true },
                  { name: 'Priority support', included: true },
                  { name: 'API access', included: false }
                ],
                aiFeatures: [],
                popular: false,
                variant: 'secondary'
              },
              {
                name: 'Professional',
                monthlyPrice: '₹9,500',
                annualPrice: '₹114,000',
                leads: '2,000 leads/month',
                features: [
                  { name: '2,000 leads/month', included: true },
                  { name: 'Advanced analytics', included: true },
                  { name: 'API access', included: true },
                  { name: 'Custom segments', included: true },
                  { name: 'Dedicated support', included: true }
                ],
                aiFeatures: [],
                popular: true,
                variant: 'primary'
              },
              {
                name: 'Enterprise',
                monthlyPrice: 'Custom',
                annualPrice: 'Custom',
                leads: 'Custom Lead Access',
                features: [
                  { name: 'Custom Lead Access', included: true },
                  { name: 'Dedicated onboarding', included: true },
                  { name: 'Custom API integration', included: true },
                  { name: 'Priority data refresh', included: true },
                  { name: '24/7 phone support', included: true }
                ],
                aiFeatures: [
                  {
                    name: 'AI Lead Scoring & Prioritization',
                    description: 'Automatically rank leads based on relevance, intent, and business fit'
                  },
                  {
                    name: 'AI-Based Smart Search Assistant',
                    description: 'Accepts natural language prompts like "Find logistics companies in Chennai hiring managers"'
                  },
                  {
                    name: 'AI ICP Matching',
                    description: 'Matches leads against your Ideal Customer Profile automatically'
                  },
                  {
                    name: 'AI Market Insights & Trends',
                    description: 'Region-wise and industry-wise demand intelligence powered by AI'
                  },
                  {
                    name: 'AI Recommendations Engine',
                    description: 'Suggests when to export, upgrade plans, or focus on high-conversion segments'
                  },
                  {
                    name: 'Custom AI Workflow Configuration',
                    description: 'AI tuned to your business, target market, and sales process'
                  },
                  {
                    name: 'Private AI Model (Enterprise)',
                    description: 'Customer-specific AI logic with no shared training data'
                  },
                  {
                    name: 'LLM-Powered Dashboard Assistant',
                    description: 'Chat-based AI assistant for lead insights, queries, and strategy suggestions'
                  }
                ],
                popular: false,
                variant: 'contact'
              }
            ].map((plan, idx) => (
              <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <PricingCard
                  name={plan.name}
                  price={plan.monthlyPrice}
                  monthlyPrice={plan.monthlyPrice}
                  annualPrice={plan.annualPrice}
                  leadsPerMonth={plan.leads}
                  features={plan.features}
                  aiFeatures={plan.aiFeatures}
                  isPopular={plan.popular}
                  isHighlighted={plan.popular}
                  buttonText={plan.name === 'Enterprise' ? 'Contact Sales' : 'Start'}
                  buttonVariant={plan.variant as any}
                  onGetStarted={() => router.push(`/payment?plan=${plan.name.toLowerCase()}`)}
                  onExploreAI={() => {
                    setShowAIFeatures(true);
                    setTimeout(() => {
                      const element = document.getElementById('ai-features-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                />
              </div>
            ))}
          </div>

          {/* AI Features Toggle Button */}
          <div className="flex justify-center mb-16">
            <button
              onClick={() => setShowAIFeatures(!showAIFeatures)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl text-blue-300 font-semibold hover:from-blue-600/30 hover:to-cyan-600/30 hover:border-blue-400 transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM5.757 4.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
              </svg>
              <span>Explore AI Features (Enterprise)</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${showAIFeatures ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

          {/* AI Features Section */}
          {showAIFeatures && (
            <div id="ai-features-section" className="mb-16 animate-fade-in scroll-mt-32">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-blue-500/30 rounded-2xl p-12">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-8 flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM5.757 4.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
                  </svg>
                  AI-Powered Intelligence (Enterprise Only)
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      name: 'AI Lead Scoring & Prioritization',
                      description: 'Automatically rank leads based on relevance, intent, and business fit to focus on high-quality prospects first.'
                    },
                    {
                      name: 'AI-Based Smart Search Assistant',
                      description: 'Search using natural language prompts like "Find logistics companies in Chennai hiring managers" for intuitive lead discovery.'
                    },
                    {
                      name: 'AI ICP Matching',
                      description: 'Automatically matches leads against your Ideal Customer Profile for precise targeting and reduced sales cycle.'
                    },
                    {
                      name: 'AI Market Insights & Trends',
                      description: 'Get region-wise and industry-wise demand intelligence powered by AI to identify high-growth opportunities.'
                    },
                    {
                      name: 'AI Recommendations Engine',
                      description: 'Intelligent suggestions on when to export, upgrade plans, or focus on high-conversion segments.'
                    },
                    {
                      name: 'Custom AI Workflow Configuration',
                      description: 'AI workflows tailored to your business, target market, and sales process for maximum relevance.'
                    },
                    {
                      name: 'Private AI Model (Enterprise)',
                      description: 'Dedicated AI logic specific to your company with no shared training data for proprietary competitive advantage.'
                    },
                    {
                      name: 'LLM-Powered Dashboard Assistant',
                      description: 'Chat-based AI assistant integrated into your dashboard for instant lead insights, queries, and strategy suggestions.'
                    }
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-slate-900/70 hover:to-slate-950/70 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <svg
                          className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="text-lg font-bold text-white">{feature.name}</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed ml-9">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trust Strip */}
          <div className="mt-20 pt-16 border-t border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-green-400 text-2xl">✓</div>
                <p className="text-slate-400 text-sm">GST Invoice Available</p>
              </div>
              <div className="space-y-2">
                <div className="text-green-400 text-2xl">✓</div>
                <p className="text-slate-400 text-sm">Enterprise compliance ready</p>
              </div>
              <div className="space-y-2">
                <div className="text-green-400 text-2xl">✓</div>
                <p className="text-slate-400 text-sm">Cancel Anytime</p>
              </div>
              <div className="space-y-2">
                <div className="text-green-400 text-2xl">✓</div>
                <p className="text-slate-400 text-sm">Secure Payments</p>
              </div>
            </div>

            <div className="text-center space-y-4 mt-12">
              <p className="text-slate-400 text-base">
                Upgrade anytime as your business scales. No long-term contracts required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-6 cursor-pointer group hover:border-blue-500 transition">
              <summary className="text-white font-semibold text-lg flex items-center justify-between">
                <span>Can I upgrade my plan anytime?</span>
                <span className="transform group-open:rotate-180 transition">
                  ▶
                </span>
              </summary>
              <p className="text-gray-300 mt-4">
                Yes, you can upgrade at any time. Your new plan will take effect
                immediately, and your billing will be adjusted proportionally.
              </p>
            </details>

            <details className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-6 cursor-pointer group hover:border-blue-500 transition">
              <summary className="text-white font-semibold text-lg flex items-center justify-between">
                <span>What payment methods do you accept?</span>
                <span className="transform group-open:rotate-180 transition">
                  ▶
                </span>
              </summary>
              <p className="text-gray-300 mt-4">
                We accept all major credit cards, UPI, and bank transfers. Your
                payment information is secure and encrypted.
              </p>
            </details>

            <details className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-6 cursor-pointer group hover:border-blue-500 transition">
              <summary className="text-white font-semibold text-lg flex items-center justify-between">
                <span>What if I need more leads?</span>
                <span className="transform group-open:rotate-180 transition">
                  ▶
                </span>
              </summary>
              <p className="text-gray-300 mt-4">
                You can purchase additional leads at any time, or contact our
                sales team for a custom enterprise plan.
              </p>
            </details>

            <details className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-6 cursor-pointer group hover:border-blue-500 transition">
              <summary className="text-white font-semibold text-lg flex items-center justify-between">
                <span>Is BizLead compliant with data regulations?</span>
                <span className="transform group-open:rotate-180 transition">
                  ▶
                </span>
              </summary>
              <p className="text-gray-300 mt-4">
                BizLead provides business contact intelligence for professional B2B outreach purposes only. We follow responsible data aggregation practices and provide opt-out mechanisms where applicable. Users are responsible for compliant usage under applicable regulations. For specific compliance questions, please contact our team.
              </p>
            </details>

            <details className="bg-slate-800/50 border border-blue-900/50 rounded-xl p-6 cursor-pointer group hover:border-blue-500 transition">
              <summary className="text-white font-semibold text-lg flex items-center justify-between">
                <span>How often is the database updated?</span>
                <span className="transform group-open:rotate-180 transition">
                  ▶
                </span>
              </summary>
              <p className="text-gray-300 mt-4">
                Our database is continuously updated using AI-assisted and multi-source verification processes to maintain data freshness and accuracy.
              </p>
            </details>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 mb-6">
              Still have questions? Book a live demo with our team.
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 mr-4"
            >
              Book Demo
            </button>
            <a
              href="https://wa.me/918148146785"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-900/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" />
              </div>
              <p className="text-gray-400">
                Access Verified Business Contacts Across India. One search. Complete leads.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/about-us" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/refund" className="hover:text-white transition">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-900/50 pt-8">
            <div className="text-center text-gray-400">
              <p className="text-xs text-gray-500 mb-3">
                BizLead provides business contact intelligence for professional B2B outreach purposes only. Users are responsible for compliant usage under applicable regulations.
              </p>
              <p className="mb-3">&copy; 2026 BizLead. All rights reserved.</p>
              <p className="text-xs text-gray-500">
                BizLead is intended for professional B2B prospecting and business outreach. Users are responsible for complying with applicable communication and data regulations.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}







