'use client';

import { useState } from 'react';

interface BillingToggleProps {
  onToggle?: (isAnnual: boolean) => void;
}

export function BillingToggle({ onToggle }: BillingToggleProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleToggle = () => {
    const newValue = !isAnnual;
    setIsAnnual(newValue);
    onToggle?.(newValue);
  };

  return (
    <div className="flex flex-col items-center gap-6 mb-16">
      <div className="flex items-center gap-4">
        <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
          Monthly
        </span>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
            isAnnual ? 'bg-blue-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ${
              isAnnual ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-lg font-medium transition-colors ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Annual
          </span>
          <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            Save 20%
          </span>
        </div>
      </div>
    </div>
  );
}
