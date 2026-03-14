'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, MapPin, Phone, Globe, Mail } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/lib/store';
import { apiClient } from '@/lib/api';

interface Lead {
  id: string;
  company: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  industry: string;
  employees: string;
}

export default function BusinessSearchPage() {
  const { theme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState('25');
  const [results, setResults] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const mockResults: Lead[] = [
    {
      id: '1',
      company: 'TechVenture Inc',
      address: '123 Innovation Ave, San Francisco, CA 94105',
      phone: '+1 (415) 555-0123',
      website: 'www.techventure.com',
      email: 'info@techventure.com',
      industry: 'Technology',
      employees: '50-100',
    },
    {
      id: '2',
      company: 'CloudFirst Solutions',
      address: '456 Cloud Street, Seattle, WA 98101',
      phone: '+1 (206) 555-0456',
      website: 'www.cloudfirst.io',
      email: 'contact@cloudfirst.io',
      industry: 'SaaS',
      employees: '100-250',
    },
    {
      id: '3',
      company: 'DataMind Analytics',
      address: '789 Big Data Blvd, Austin, TX 78701',
      phone: '+1 (512) 555-0789',
      website: 'www.datamind.ai',
      email: 'sales@datamind.ai',
      industry: 'AI/ML',
      employees: '25-50',
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    setHasSearched(true);

    try {
      // Debug: Check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.warn('⚠️ No authentication token found. User may not be logged in.');
        toast.error('❌ You are not authenticated. Please log in again.');
        return;
      }
      console.log('🔐 Token found, proceeding with search...');
      
      const response = await apiClient.post('/api/v1/bizlead/scraper/search', {
        query: query,
        max_results: parseInt(maxResults),
      });
      
      // Map API response to Lead interface
      const leads = (response.data.leads || [])
        .map((lead: any) => ({
          id: lead.id || `lead-${Math.random()}`,
          company: lead.name || 'Unknown Company',
          address: lead.address || 'Address not available',
          phone: lead.phone || 'Not provided',
          website: lead.website || 'Not provided',
          email: lead.email || 'Not provided',
          industry: 'General Business', // Not provided by API
          employees: 'Unknown', // Not provided by API
        }));
        // NOTE: No email filtering - we'll show all leads even without emails
        // Email scraping is disabled for performance (was causing 60s timeouts)
      
      setResults(leads);
      
      // Show helpful message if all results were duplicates
      if (leads.length === 0 && response.data.duplicate_count > 0) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold">✅ Search Complete - All Results Already Saved</div>
            <div>Found {response.data.duplicate_count} {response.data.duplicate_count === 1 ? 'lead' : 'leads'}, but {response.data.duplicate_count === 1 ? 'it is' : 'they are all'} already in your database.</div>
            <div className="text-sm opacity-80">💡 Try: Different location, industry, or search terms to find new leads</div>
            <div className="text-sm opacity-80">📂 View your saved leads in the Database page</div>
          </div>
        ), {
          duration: 8000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
            color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
            border: `2px solid ${theme === 'dark' ? '#3b82f6' : '#3b82f6'}`,
            padding: '16px',
            borderRadius: '12px',
          }
        });
      } else if (leads.length > 0) {
        toast.success(`✅ Found ${leads.length} new ${leads.length === 1 ? 'lead' : 'leads'}!`);
      }

      // AUTO-SAVE: Automatically save results to database for 30 days
      if (leads.length > 0) {
        try {
          console.log(`💾 Auto-saving ${leads.length} leads to database...`);
          const saveResponse = await apiClient.post('/api/v1/bizlead/scraper/save-results', {
            query: query,
            leads: leads.map((lead: any) => ({
              name: lead.company,
              address: lead.address,
              phone: lead.phone,
              website: lead.website,
              email: lead.email,
              id: lead.id,
            })),
          });
          console.log('✅ Results automatically saved to database');
          toast.success(`✅ ${leads.length} leads automatically saved to database for 30 days!`);
        } catch (saveError: any) {
          console.log('⚠️ Auto-save failed, but search results are displayed:', saveError.message);
          toast.error('⚠️ Could not auto-save results, but they are displayed above');
          // Don't show error to user - search was successful, just auto-save failed
        }
      }
    } catch (error: any) {
      console.error('❌ Search failed:', error);
      console.error('📊 HTTP Status:', error.response?.status);
      console.error('📝 Backend Error:', error.response?.data?.detail || 'No detail provided');
      console.error('🔍 Full Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      // Show specific error messages
      if (error.response?.status === 401) {
        console.warn('🔓 Authentication failed - Invalid or expired token');
        toast.error('❌ Your session has expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
      } else if (error.response?.status === 404) {
        console.warn('🚫 Search endpoint not found - Please check API configuration');
        toast.error('❌ Search service not found. Please check your connection.');
      } else if (error.response?.status === 402) {
        console.warn('💳 Payment/Subscription issue');
        toast.error('❌ Payment required. Please upgrade your subscription.');
      } else if (error.response?.data?.detail) {
        console.warn('⚠️ API returned error detail:', error.response.data.detail);
        toast.error(`❌ ${error.response.data.detail}`);
      } else if (error.message === 'Network Error') {
        console.warn('🌐 Network connectivity issue');
        toast.error('❌ Network error. Please check your internet connection.');
      } else {
        console.warn('❓ Unknown error occurred');
        toast.error('❌ Search failed. Please try again.');
      }
      
      // Don't show mock results on error
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadCSV = () => {
    // Simple CSV generation
    const headers = ['Company', 'Address', 'Phone', 'Website', 'Email', 'Industry', 'Employees'];
    const csvContent = [
      headers.join(','),
      ...results.map((lead) =>
        [lead.company, lead.address, lead.phone, lead.website, lead.email, lead.industry, lead.employees]
          .map((field) => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `bizlead-export-${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
        : 'bg-gradient-to-br from-white via-slate-50 to-slate-100'
    }`}>
      <Toaster position="top-center" />
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Business Search</h1>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Search and extract verified business leads with AI-powered filtering</p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className={`group relative p-6 lg:p-8 rounded-2xl border ${
          theme === 'dark'
            ? 'border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950'
            : 'border-slate-300 bg-gradient-to-br from-white via-slate-50 to-slate-100'
        }`}
      >
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Search Query</label>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Manufacturing company in coimbatore..."
                className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:border-blue-500 ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-blue-500/30 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Max Results */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Maximum Results</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:border-blue-500 ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-blue-500/30 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="10">10 leads</option>
              <option value="25">25 leads</option>
              <option value="50">50 leads</option>
              <option value="75">75 leads</option>
              <option value="100">100 leads (Max)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={searching}
              className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/50'
                  : 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600'
              }`}
            >
              {searching ? 'Searching...' : 'Search Leads'}
            </button>
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadCSV}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  theme === 'dark'
                    ? 'text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50'
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`}
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Results Table */}
      {results.length > 0 && (
        <div className={`group relative rounded-2xl border overflow-hidden ${
          theme === 'dark'
            ? 'border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950'
            : 'border-slate-300 bg-gradient-to-br from-white via-slate-50 to-slate-100'
        }`}>
          <div className={`p-6 border-b ${
            theme === 'dark' ? 'border-blue-500/20' : 'border-slate-300'
          }`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Search Results <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>({results.length} leads)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 border-b ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-blue-500/20'
                  : 'bg-slate-100 border-slate-300'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Company Name</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Address</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Phone</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Website</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Email</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-blue-500/10' : 'divide-slate-200'}`}>
                {results.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`transition-colors cursor-pointer group/row ${
                      theme === 'dark'
                        ? 'hover:bg-blue-500/5'
                        : 'hover:bg-slate-200/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium group-hover/row:text-blue-300 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>{lead.company}</p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>{lead.industry}</p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                      <div className="flex items-start gap-2">
                        <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className="text-xs">{lead.address}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                      {lead.website && lead.website !== 'N/A' && lead.website !== 'Not provided' ? (
                        <a
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 transition-colors ${
                            theme === 'dark'
                              ? 'hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          <Globe className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          <span>{lead.website}</span>
                        </a>
                      ) : (
                        <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>N/A</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                      {lead.email && lead.email !== 'N/A' && lead.email !== 'Not provided' ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className={`flex items-center gap-2 transition-colors ${
                            theme === 'dark'
                              ? 'hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          <span className="text-xs">{lead.email}</span>
                        </a>
                      ) : (
                        <span className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                          <Mail className="w-4 h-4 opacity-50" />
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && hasSearched && (
        <div className={`text-center py-12 rounded-2xl border ${
          theme === 'dark' 
            ? 'border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950' 
            : 'border-slate-300 bg-gradient-to-br from-white via-slate-50 to-slate-100'
        }`}>
          <div className={`mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <Search className={`w-12 h-12 mx-auto mb-4 opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
            <p className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {query ? `No new results for "${query}"` : 'No results found'}
            </p>
            <div className={`max-w-md mx-auto space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <p>💡 This might mean:</p>
              <ul className="list-none space-y-1">
                <li>✓ All found leads are already saved in your database</li>
                <li>✓ No businesses match your exact search criteria</li>
              </ul>
              <p className="mt-4 font-medium">Try:</p>
              <ul className="list-none space-y-1">
                <li>🔍 Different search terms or location</li>
                <li>📂 Check your Database page for existing leads</li>
                <li>🌍 Search a different city or region</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
