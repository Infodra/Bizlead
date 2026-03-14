'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface SaveLadModalProps {
  lead: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  sourceQuery?: string;
  onSuccess?: () => void;
}

export default function SaveLeadModal({ lead, sourceQuery, onSuccess }: SaveLadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('New');
  const [success, setSuccess] = useState(false);

  const categories = ['New', 'Contacted', 'Converted', 'Qualified', 'Rejected'];

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.post('/api/v1/bizlead/crm/save-lead', {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
        source_query: sourceQuery,
        category
      });

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setCategory('New');
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white text-sm font-medium rounded-lg hover:from-[#2563EB] hover:to-[#0891B2] transition-colors"
      >
        Save to CRM
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111C2E] border border-white/5 rounded-xl shadow-2xl shadow-black/50 max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#F8FAFC] mb-4">Save Lead to CRM</h2>

            {success && (
              <div className="mb-4 p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg text-[#22C55E] text-sm">
                ✓ Lead saved successfully!
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            {!success && (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                      Lead Name
                    </label>
                    <p className="text-[#F8FAFC] font-medium">{lead.name}</p>
                  </div>

                  {lead.email && (
                    <div>
                      <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                        Email
                      </label>
                      <p className="text-[#94A3B8] text-sm">{lead.email}</p>
                    </div>
                  )}

                  {lead.phone && (
                    <div>
                      <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                        Phone
                      </label>
                      <p className="text-[#94A3B8] text-sm">{lead.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-3">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            category === cat
                              ? 'bg-[#3B82F6] text-white border border-[#3B82F6]'
                              : 'bg-white/5 border border-white/10 text-[#CBD5E1] hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-[#CBD5E1] font-medium hover:bg-white/5"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white rounded-lg font-medium hover:from-[#2563EB] hover:to-[#0891B2] disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
