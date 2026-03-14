'use client';

import { useState, useEffect } from 'react';
import { Search, Download, ChevronDown, Trash2, Mail, Phone } from 'lucide-react';
import { useThemeStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface SavedLead {
  _id?: string;
  id?: string;
  name?: string;
  company?: string;
  address?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  employees?: string;
  savedDate?: string;
  created_at?: string;
  status?: string;
}

export default function DatabasePage() {
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch saved leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try database/my-leads first (manually saved leads + search results)
        try {
          const response = await apiClient.get('/api/v1/bizlead/database/my-leads');
          
          // Normalize the response data
          const allLeads = (response.data.leads || response.data || []);
          const leads = allLeads.map((lead: SavedLead) => ({
            id: lead._id || lead.id || `lead-${Math.random()}`,
            company: lead.name || lead.company || 'Unknown',
            address: lead.address || lead.location || '',
            location: lead.address || lead.location || '',
            email: lead.email || '',
            phone: lead.phone || '',
            website: lead.website || '',
            industry: lead.industry || 'General Business',
            employees: lead.employees || 'Unknown',
            savedDate: lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Unknown',
            status: lead.status || 'new',
          }));
          
          setSavedLeads(leads);
          console.log(`✅ Loaded ${leads.length} saved leads from database`);
        } catch (dbError) {
          // Database endpoint failed, trying alternative...
          
          // Fallback to scraper/my-search-results
          const searchResponse = await apiClient.get('/api/v1/bizlead/scraper/my-search-results');
          
          const allLeads = (searchResponse.data.search_results || searchResponse.data || []);
          const leads = allLeads.flatMap((result: any) => {
            return (result.leads || []).map((lead: SavedLead) => ({
              id: lead.id || `lead-${Math.random()}`,
              company: lead.name || lead.company || 'Unknown',
              address: lead.address || '',
              location: lead.address || '',
              email: lead.email || '',
              phone: lead.phone || '',
              website: lead.website || '',
              industry: lead.industry || 'General Business',
              employees: lead.employees || 'Unknown',
              savedDate: result.created_at ? new Date(result.created_at).toLocaleDateString() : 'Unknown',
              status: 'new',
            }));
          });
          
          setSavedLeads(leads);
          console.log(`✅ Loaded ${leads.length} leads from search results`);
        }
      } catch (err: any) {
        console.error('Failed to fetch leads:', err);
        setError('Failed to load saved leads. Try running a search to save leads.');
        setSavedLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const mockLeads = [
    {
      id: '1',
      company: 'TechVenture Inc',
      industry: 'Software',
      location: 'San Francisco, CA',
      employees: '150-250',
      website: 'techventure.io',
      email: 'sales@techventure.io',
      phone: '+1 (555) 234-5678',
      savedDate: 'Mar 10, 2026',
      status: 'qualified',
    },
    {
      id: '2',
      company: 'CloudFirst Solutions',
      industry: 'Cloud Services',
      location: 'New York, NY',
      employees: '50-100',
      website: 'cloudfirst.com',
      email: 'hello@cloudfirst.com',
      phone: '+1 (555) 345-6789',
      savedDate: 'Mar 8, 2026',
      status: 'contacted',
    },
    {
      id: '3',
      company: 'DataMind Analytics',
      industry: 'Analytics',
      location: 'Austin, TX',
      employees: '100-150',
      website: 'datamind.io',
      email: 'contact@datamind.io',
      phone: '+1 (555) 456-7890',
      savedDate: 'Mar 5, 2026',
      status: 'new',
    },
    {
      id: '4',
      company: 'SecureNet Systems',
      industry: 'Cybersecurity',
      location: 'Boston, MA',
      employees: '200-300',
      website: 'securenet.io',
      email: 'partnerships@securenet.io',
      phone: '+1 (555) 567-8901',
      savedDate: 'Mar 1, 2026',
      status: 'qualified',
    },
    {
      id: '5',
      company: 'DevOps Pro',
      industry: 'DevOps',
      location: 'Seattle, WA',
      employees: '75-125',
      website: 'devopspro.dev',
      email: 'sales@devopspro.dev',
      phone: '+1 (555) 678-9012',
      savedDate: 'Feb 28, 2026',
      status: 'contacted',
    },
  ];

  const filteredLeads = savedLeads.filter(
    (lead) =>
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const saveToCRM = async (lead: SavedLead) => {
    try {
      const response = await apiClient.post('/api/v1/bizlead/crm/save-lead', {
        name: lead.company,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        website: lead.website,
        industry: lead.industry,
        location: lead.location,
        address: lead.location,
      });
      
      toast.success(`✅ ${lead.company} saved to CRM!`, {
        duration: 4,
        position: 'bottom-right',
      });
      
      console.log('Lead saved to CRM:', response.data);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to save to CRM';
      toast.error(errorMsg, {
        duration: 4,
        position: 'bottom-right',
      });
      console.error('CRM save error:', err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    
    if (!confirm(`Delete ${selectedRows.length} selected lead(s)?`)) return;
    
    try {
      await Promise.all(
        selectedRows.map(id => 
          apiClient.delete(`/api/v1/bizlead/database/leads/${id}`)
        )
      );
      
      setSavedLeads(prev => prev.filter(lead => !selectedRows.includes(lead.id || '')));
      setSelectedRows([]);
      toast.success(`✅ ${selectedRows.length} lead(s) deleted!`, {
        duration: 4,
        position: 'bottom-right',
      });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to delete leads';
      toast.error(errorMsg, {
        duration: 4,
        position: 'bottom-right',
      });
      console.error('Delete error:', err);
    }
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export', {
        duration: 4,
        position: 'bottom-right',
      });
      return;
    }

    // Create CSV content
    const headers = ['Company', 'Industry', 'Location', 'Email', 'Phone', 'Website', 'Saved Date'];
    const rows = filteredLeads.map(lead => [
      lead.company || '',
      lead.industry || '',
      lead.location || '',
      lead.email || '',
      lead.phone || '',
      lead.website || '',
      lead.savedDate || '',
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bizlead-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('✅ Leads exported successfully!', {
      duration: 4,
      position: 'bottom-right',
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    setSelectedRows(
      selectedRows.length === filteredLeads.length ? [] : filteredLeads.map((l) => l.id).filter((id): id is string => id !== undefined)
    );
  };

  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
        : 'bg-gradient-to-br from-white via-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Saved Leads Database</h1>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage and organize {savedLeads.length} leads from your searches (auto-saved for 30 days)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            : 'bg-yellow-100 border-yellow-300 text-yellow-700'
        }`}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={`p-8 rounded-lg border ${
          theme === 'dark'
            ? 'bg-slate-900/50 border-blue-500/20'
            : 'bg-slate-100 border-slate-300'
        }`}>
          <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Loading saved leads...
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-lg bg-slate-900/50 border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 border border-blue-500/30 hover:bg-blue-500/10 text-slate-300 font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedRows.length > 0 && (
        <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <span className="text-white font-medium">{selectedRows.length} selected</span>
          <button 
            onClick={handleDeleteSelected}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="group relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/20 bg-slate-900/30">
                <th className="w-12 px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredLeads.length}
                    onChange={toggleAllRows}
                    className="w-4 h-4 rounded border-blue-500/50 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Company
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300">
                  Industry
                </th>
                <th className="px-3 py-4 text-left text-sm font-semibold text-slate-300">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Saved
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Save
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/10">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-blue-500/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={lead.id ? selectedRows.includes(lead.id) : false}
                      onChange={() => lead.id && toggleRow(lead.id)}
                      className="w-4 h-4 rounded border-blue-500/50 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white">{lead.company}</p>
                      <p className="text-xs text-slate-500 mt-1">{lead.website}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{lead.industry}</td>
                  <td className="px-3 py-4 text-slate-300 max-w-xs truncate">{lead.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300 text-sm">
                        {lead.email || '-'}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 text-sm">{lead.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{lead.savedDate}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => saveToCRM(lead)} className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm ${
                      theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400">No leads found matching your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          Showing {paginatedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
        </p>
        <div className="flex gap-2 items-center">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-blue-500/30 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 font-medium rounded-lg transition-colors">
            Previous
          </button>
          <span className="text-slate-400 text-sm px-3">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 border border-blue-500/30 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 font-medium rounded-lg transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
