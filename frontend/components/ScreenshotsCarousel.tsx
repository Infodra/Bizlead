'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, BarChart3, Database, Users, Zap } from 'lucide-react';

interface Screenshot {
  id: number;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
}

export function ScreenshotsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const screenshots: Screenshot[] = [
    {
      id: 1,
      title: "Business Search",
      description: "Search for leads using advanced filters like industry, location, and company size. Get verified business contacts instantly.",
      features: ["Advanced search filters", "Download results in CSV", "Real-time lead verification"],
      icon: <Search size={48} />,
      gradient: "from-blue-600 to-cyan-500",
      accentColor: "blue"
    },
    {
      id: 2,
      title: "AI Intelligence Dashboard",
      description: "Real-time B2B lead performance analytics powered by AI. Monitor lead usage, credits, and get actionable insights.",
      features: ["Track monthly usage trends", "AI-powered recommendations", "Monitor subscription credits"],
      icon: <BarChart3 size={48} />,
      gradient: "from-purple-600 to-pink-500",
      accentColor: "purple"
    },
    {
      id: 3,
      title: "Lead Database",
      description: "Manage and organize all your collected leads in one place. Export to CSV, add notes, and track lead status.",
      features: ["Organize all collected leads", "Auto-delete after 30 days", "Bulk export tools"],
      icon: <Database size={48} />,
      gradient: "from-green-600 to-emerald-500",
      accentColor: "green"
    },
    {
      id: 4,
      title: "CRM Integration",
      description: "Seamlessly save leads to your CRM with custom categories. Track lead status from New to Qualified to Converted.",
      features: ["Categorize leads (New, Contacted)", "Add custom notes", "Long-term tracking"],
      icon: <Users size={48} />,
      gradient: "from-orange-600 to-red-500",
      accentColor: "orange"
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, screenshots.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const current = screenshots[currentSlide];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Powerful Features in Action
          </h2>
          <p className="text-xl text-slate-800 max-w-2xl mx-auto">
            See how BizLead helps you find, manage,<br className="hidden sm:block" />
            and convert B2B leads with ease
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 backdrop-blur-sm"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          {/* Animated Slide Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px] md:min-h-[600px]">
            {/* Visual Demo - App Mockup (2/3 width) */}
            <div className="md:col-span-2 hidden md:flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 relative overflow-hidden">
              {/* App Frame */}
              <div className="w-full h-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden border-8 border-slate-700">
                {/* Navbar */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">B</div>
                  <span className="text-white font-bold text-lg">BizLead</span>
                </div>

                {/* App Header */}
                <div className="bg-slate-700 px-4 py-4 border-b border-slate-600">
                  <h3 className="text-white font-bold text-base mb-2">
                    {currentSlide === 0 && "Search Results (20 found)"}
                    {currentSlide === 1 && "Analytics Dashboard"}
                    {currentSlide === 2 && "My Leads Database"}
                    {currentSlide === 3 && "Lead Management"}

                  </h3>
                  <p className="text-slate-200 text-sm font-semibold">Browse and manage your business leads</p>
                </div>

                {/* Content Area with Blur */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-64">
                  {/* Mock Search Result 1 */}
                  {(currentSlide === 0) && (
                    <>
                      <div className="bg-slate-600 border border-slate-500 rounded-lg p-2 flex items-center gap-2 mb-2">
                        <span className="text-slate-300">🔍</span>
                        <input 
                          type="text" 
                          placeholder="Search for leads (Company, Email, Industry...)" 
                          className="bg-slate-600 text-slate-200 text-xs placeholder-slate-400 focus:outline-none w-full"
                        />
                      </div>
                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">Acme Corporation</p>
                          <p className="text-xs text-slate-300 font-medium">john.smith@acme.com</p>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1 font-medium">
                          <p><span className="font-bold">Phone:</span> +91 9876543210</p>
                          <p><span className="font-bold">Industry:</span> Manufacturing</p>
                        </div>
                      </div>

                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">TechStart Inc</p>
                          <p className="text-xs text-slate-300 font-medium">sarah.johnson@techstart.io</p>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1 font-medium">
                          <p><span className="font-bold">Phone:</span> +91 9123456789</p>
                          <p><span className="font-bold">Industry:</span> Software</p>
                        </div>
                      </div>

                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">GlobalTrade Ltd</p>
                          <p className="text-xs text-slate-300 font-medium">contact@globaltrade.com</p>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1 font-medium">
                          <p><span className="font-bold">Phone:</span> +91 9234567890</p>
                          <p><span className="font-bold">Industry:</span> Retail</p>
                        </div>
                      </div>
                    </>
                  )}

                  {currentSlide === 1 && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                          <p className="text-xs text-slate-300 mb-2">This Month Usage</p>
                          <svg className="w-full h-16" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <polyline
                              points="5,35 25,20 45,28 65,10 85,22"
                              fill="none"
                              stroke="#0ea5e9"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="text-xs text-slate-300 mt-2">📊 Trending upward</p>
                        </div>

                        <div className="bg-slate-600 border border-slate-500 rounded-lg p-3">
                          <p className="text-xs font-semibold text-slate-200">💡 AI Recommendation</p>
                          <p className="text-xs text-slate-300 mt-1">Your best results come from targeting Manufacturing & Tech sectors</p>
                        </div>

                        <div className="bg-slate-600 border border-slate-500 rounded-lg p-3">
                          <p className="text-xs text-slate-200">Credits Remaining</p>
                          <p className="text-lg font-bold text-cyan-400">450 / 500</p>
                        </div>
                      </div>
                    </>
                  )}

                  {currentSlide === 2 && (
                    <>
                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">Premium Tech Solutions</p>
                            <p className="text-xs text-slate-300">contact@premiumtech.com</p>
                          </div>
                          <div className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Qualified</div>
                        </div>
                        <p className="text-xs text-slate-300">📝 Note: Follow up next week</p>
                      </div>

                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">Northwest Manufacturing</p>
                            <p className="text-xs text-slate-300">sales@nwmfg.com</p>
                          </div>
                          <div className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">In Progress</div>
                        </div>
                        <p className="text-xs text-slate-300">📝 Note: Waiting for budget approval</p>
                      </div>

                      <div className="text-xs text-slate-200 bg-slate-700 border border-slate-600 rounded-lg p-2">
                        ✓ Auto-delete in 25 days • 📥 Export to CSV • 🔄 Bulk actions
                      </div>
                    </>
                  )}

                  {currentSlide === 3 && (
                    <>
                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">Enterprise Solutions Inc</p>
                            <p className="text-xs text-slate-300">enterprise@solusinc.com</p>
                          </div>
                          <div className="text-xs bg-red-600 text-white px-2 py-1 rounded">Hot</div>
                        </div>
                        <div className="text-xs text-slate-300 mb-2">
                          <p><strong>Category:</strong> B2B SaaS</p>
                          <p><strong>Status:</strong> Qualified Lead</p>
                        </div>
                        <textarea className="w-full text-xs p-1 border border-slate-600 rounded bg-slate-800 text-slate-200" rows={2} defaultValue="Called 2/19, interested in demo next week"></textarea>
                      </div>

                      <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">Digital Ventures LLC</p>
                            <p className="text-xs text-slate-300">hello@digitalventures.com</p>
                          </div>
                          <div className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Pending</div>
                        </div>
                        <div className="text-xs text-slate-300 mb-2">
                          <p><strong>Category:</strong> Consulting</p>
                          <p><strong>Status:</strong> New Lead</p>
                        </div>
                        <textarea className="w-full text-xs p-1 border border-slate-600 rounded bg-slate-800 text-slate-200" rows={2} defaultValue="Send intro email with case studies"></textarea>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section (1/3 width) */}
            <div className="flex flex-col justify-center p-6 md:p-8 md:col-span-1">
              {/* Title and Description */}
              <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${
                currentSlide === 0 ? 'text-blue-400' :
                currentSlide === 1 ? 'text-purple-400' :
                currentSlide === 2 ? 'text-green-400' :
                'text-orange-400'
              }`}>
                {current.title}
              </h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                {current.description}
              </p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'bg-blue-500 w-12 h-3'
                    : 'bg-slate-600 hover:bg-slate-500 w-3 h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-6">
          <p className="text-slate-400">
            <span className="text-blue-400 font-semibold">{currentSlide + 1}</span>
            <span> / </span>
            <span className="text-slate-300 font-semibold">{screenshots.length}</span>
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <p className="text-slate-300 text-lg font-semibold">Ready to find verified B2B leads? Contact us for access.</p>
        </div>
      </div>
    </section>
  );
}
