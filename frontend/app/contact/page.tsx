"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Logo } from "@/components/Logo";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessageId, setSuccessMessageId] = useState<string>("");
  const [submittedData, setSubmittedData] = useState({ name: "", email: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Send form data to backend API
      const response = await fetch("http://localhost:8000/api/v1/contact/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          product: formData.product || "General Inquiry",
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.detail || "Failed to send message. Please try again.");
        return;
      }

      const result = await response.json();
      
      // Store submitted data before clearing form
      setSubmittedData({
        name: formData.name,
        email: formData.email,
      });
      
      // Show success modal
      setSuccessMessageId(result.message_id || "");
      setShowSuccess(true);
      
      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        product: "",
        message: "",
      });
      
        // Message submitted successfully
      
      // Auto-hide success modal after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to send message. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "How long does it take to get a response?",
      answer: "Our team typically responds within 24 hours during business hours.",
    },
    {
      question: "Which plans are best for my business?",
      answer: "It depends on your lead generation needs. Start with Starter for testing, Professional for regular use, or Enterprise for unlimited access.",
    },
    {
      question: "Do you offer trial periods or demos?",
      answer: "Yes, we offer demos of our platform. Contact our sales team for more details.",
    },
    {
      question: "What are your payment terms?",
      answer: "We offer flexible monthly and annual billing options. Contact us for custom enterprise terms.",
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
            <a href="/home#pricing" className="text-gray-300 hover:text-white transition">
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-300">
            Have questions? Our team is ready to help you find the perfect lead generation solution for your business.
          </p>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">ADDRESS</h3>
                <p className="text-gray-300">
                  INNOV8, 2ND FLOOR<br />
                  RMZ MILLENIA BUSINESS PARK<br />
                  CAMPUS 1A, NO.143, DR.M.G.R.ROAD<br />
                  PERUNGUDI, CHENNAI-600096
                </p>
              </div>

              {/* Phone */}
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">PHONE</h3>
                <a href="tel:+918148146785" className="text-gray-300 hover:text-blue-400 transition">
                  +91 81481 46785
                </a>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">EMAIL</h3>
                <a href="mailto:business@infodratechnologies.com" className="text-gray-300 hover:text-blue-400 transition">
                  business@infodratechnologies.com
                </a>
              </div>

              {/* WhatsApp */}
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">QUICK CONTACT</h3>
                <a 
                  href="https://wa.me/918148146785?text=Hi%20Infodra%20Team%2C%20I%20need%20demo%20for%20BizLead.%20Please%20share%20details."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Chat on WhatsApp
                </a>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">BUSINESS HOURS</h3>
                <div className="text-gray-300 space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Send us a Message</h2>
            <p className="text-gray-300 mb-6">Fill out the form below and our team will get back to you within 24 hours.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Name <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Email <span className="text-blue-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Phone <span className="text-blue-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Product */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Product / Service
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Select a product...</option>
                  <option value="live-demo">Live Demo</option>
                  <option value="bizlead">BizLead Database</option>
                  <option value="api">API Access</option>
                  <option value="enterprise">Enterprise Solution</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Message <span className="text-blue-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              <p className="text-sm text-gray-400">* Required fields</p>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
              <p className="text-gray-300 mb-4">
                Thank you for reaching out. We've received your message and will get back to you within 24 hours.
              </p>

              {/* Message ID Display */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-400 mb-1">Message ID</p>
                <code className="text-sm text-blue-400 break-all font-mono">{successMessageId}</code>
              </div>

              {/* Confirmation Details */}
              <div className="text-left space-y-2 mb-6">
                <p className="text-sm text-gray-300">
                  <span className="text-blue-400 font-semibold">Name:</span> {submittedData.name}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-blue-400 font-semibold">Email:</span> {submittedData.email}
                </p>
              </div>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}

      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-slate-950/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/70 transition"
                >
                  <h3 className="text-lg font-semibold text-white text-left">{faq.question}</h3>
                  <span className="text-blue-400 text-2xl">{expandedFaq === idx ? "−" : "+"}</span>
                </button>
                
                {expandedFaq === idx && (
                  <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/20">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900/95 to-slate-900/70 border-t border-slate-700/50 py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo & Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-gray-400 text-sm">
                Access Verified Business Contacts Across India. One search. Complete leads.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-6">
                <li><a href="tel:+918148146785" className="hover:text-white transition">+91 81481 46785</a></li>
                <li><a href="mailto:business@infodratechnologies.com" className="hover:text-white transition">business@infodra.com</a></li>
              </ul>
              {/* Social Media Icons */}
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/17tsnE46Cv/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/infodratech?igsh=MmpkczBpMTE0dzRh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/infodra-technologies-private-limited/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition" title="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.836 0-9.754h3.554v1.391c.432-.666 1.204-1.61 2.928-1.61 2.136 0 3.745 1.393 3.745 4.385v5.588zM5.337 9.433c-1.144 0-1.915-.762-1.915-1.715 0-.955.771-1.715 1.921-1.715 1.147 0 1.917.76 1.917 1.715 0 .953-.771 1.715-1.921 1.715zm1.946-9.229H3.391v9.754h3.892V.204zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://wa.me/918148146785" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition" title="WhatsApp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149c-1.488.694-2.744 1.777-3.642 3.02-.897 1.244-1.4 2.652-1.423 4.093-.023 1.441.327 2.847 1.015 4.117.688 1.27 1.639 2.347 2.74 3.155 1.1.808 2.313 1.337 3.607 1.542 1.294.205 2.62.123 3.9-.267 1.28-.39 2.466-1.06 3.415-1.932.95-.873 1.565-1.833 1.846-2.909.281-1.076.35-2.16.264-3.226-.086-1.067-.4-2.076-.922-2.948-.522-.873-1.265-1.627-2.165-2.165-.9-.537-1.922-.852-2.989-.902zm0 0"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-700 pt-8\">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>© 2026 Infodra Technologies Private Limited. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0 flex-wrap justify-center">
                <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition">Terms of Service</a>
                <a href="/refund" className="hover:text-white transition">Refund Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
