'use client';

import { useState, useEffect } from 'react';
import { Trash2, Mail, Phone, Globe } from 'lucide-react';
import { useThemeStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface CRMLead {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  company?: string;
  industry?: string;
  address?: string;
  location?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  saved_at?: string;
  source_query?: string;
}

export default function CRMLeadsPage() {
  const { theme } = useThemeStore();
  const [crmLeads, setCRMLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch CRM leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/bizlead/crm/my-leads', {
        params: {
          skip: 0,
          limit: 100,
          ...(filterStatus !== 'all' && { status: filterStatus }),
        },
      });

      const leads = (response.data.leads || []).map((lead: CRMLead) => ({
        id: lead._id || lead.id || `lead-${Math.random()}`,
        _id: lead._id,
        name: lead.name || 'Unknown',
        email: lead.email || '',
        phone: lead.phone || '',
        website: lead.website || '',
        company: lead.company || lead.name || 'Unknown',
        industry: lead.industry || 'General Business',
        address: lead.address || lead.location || '',
        location: lead.address || lead.location || '',
        status: lead.status || 'new',
        tags: lead.tags || [],
        notes: lead.notes || '',
        saved_at: lead.saved_at
          ? new Date(lead.saved_at).toLocaleDateString()
          : 'Unknown',
        source_query: lead.source_query || '',
      }));

      setCRMLeads(leads);
      // Loaded CRM leads successfully
    } catch (err: any) {
      console.error('Failed to fetch CRM leads:', err);
      setError('Failed to load CRM leads');
      toast.error('Failed to load CRM leads');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await apiClient.delete(`/api/v1/bizlead/crm/leads/${leadId}`);
      setCRMLeads(crmLeads.filter((lead) => lead._id !== leadId));
      toast.success('Lead deleted successfully');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete lead');
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/v1/bizlead/crm/leads/${leadId}`, {
        status: newStatus,
      });

      setCRMLeads(
        crmLeads.map((lead) =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      toast.success('Status updated successfully');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Failed to update status');
    }
  };

  const filteredLeads = crmLeads
    .filter((lead) => {
      const matchesSearch =
        (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || lead.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.saved_at || 0).getTime();
      const dateB = new Date(b.saved_at || 0).getTime();
      return dateB - dateA;
    });

  const statusOptions = ['new', 'contacted', 'qualified', 'converted', 'rejected'];
  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300',
    contacted: 'bg-yellow-500/20 text-yellow-300',
    qualified: 'bg-green-500/20 text-green-300',
    converted: 'bg-emerald-500/20 text-emerald-300',
    rejected: 'bg-red-500/20 text-red-300',
  };

  if (loading) {
    return (
      <div
        className={`flex-1 p-4 lg:p-8 space-y-8 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-blue-50 via-white to-slate-50'
        }`}
      >
        <div className="flex items-center justify-center h-64">
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Loading CRM leads...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 p-4 lg:p-8 space-y-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-white to-slate-50'
      }`}
    >
      {/* Stats Cards - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-blue-900/20 border-blue-500/20'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Total Leads
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {crmLeads.length}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-green-900/20 border-green-500/20'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Qualified
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            {crmLeads.filter((l) => l.status === 'qualified').length}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-emerald-900/20 border-emerald-500/20'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Converted
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {crmLeads.filter((l) => l.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            CRM Leads
          </h1>
          <p
            className={`mt-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 rounded-lg border ${
          theme === 'dark'
            ? 'bg-blue-900/20 border-blue-500/20'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-slate-900/50 border-blue-500/30 text-white placeholder-slate-500'
                : 'bg-white border-blue-200 text-slate-900 placeholder-slate-400'
            } transition-colors`}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-900/50 border-blue-500/30 text-white'
              : 'bg-white border-blue-200 text-slate-900'
          } transition-colors`}
        >
          <option value="all">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      {error ? (
        <div
          className={`p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-red-900/20 border-red-500/30 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {error}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          className={`p-8 text-center rounded-lg border-2 border-dashed ${
            theme === 'dark'
              ? 'bg-slate-900/20 border-blue-500/30'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <p
            className={`text-lg font-medium ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            No CRM leads yet
          </p>
          <p
            className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            Save leads from the Database page to manage them here
          </p>
        </div>
      ) : (
        <div
          className={`rounded-lg border overflow-hidden ${
            theme === 'dark'
              ? 'bg-slate-900/30 border-blue-500/20'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  theme === 'dark'
                    ? 'bg-blue-900/30 border-blue-500/20'
                    : 'bg-blue-50 border-slate-200'
                } border-b`}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Saved
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-blue-500/10' : 'divide-slate-200'
              }`}>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-blue-500/5 transition-colors group ${
                      theme === 'dark' ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'
                    }`}
                  >
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    } font-medium`}>
                      {lead.name || 'Unknown'}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    } text-sm`}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-blue-400"
                        >
                          {lead.email || '-'}
                        </a>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    } text-sm`}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{lead.phone || '-'}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {lead.company}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleUpdateStatus(lead._id!, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border-0 cursor-pointer transition-colors bg-blue-600 hover:bg-blue-700 text-white`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    } text-sm`}>
                      {lead.saved_at}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteLead(lead._id!)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                              : 'hover:bg-red-100 text-slate-600 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
