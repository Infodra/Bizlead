'use client';

interface AccountSummaryProps {
  user?: any;
  dashboardData?: any;
}

export default function AccountSummary({ user, dashboardData }: AccountSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-[#162338] to-[#0B1220] rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-bold text-white mb-6">Account Summary</h3>

      <div className="space-y-4">
        {/* Current Plan */}
        <div>
          <p className="text-[#94A3B8] text-sm mb-2">Current Plan</p>
          <p className="text-white font-semibold text-lg">{dashboardData?.plan || 'Starter'}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-[#94A3B8] text-sm mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-white font-semibold">Active</p>
          </div>
        </div>

        {/* Member Since */}
        <div>
          <p className="text-[#94A3B8] text-sm mb-2">Member Since</p>
          <p className="text-white font-semibold">
            {dashboardData?.member_since || new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Leads Limit */}
        <div>
          <p className="text-[#94A3B8] text-sm mb-2">Leads Used</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white">{dashboardData?.leads_used || 0}</span>
              <span className="text-[#94A3B8]">/{dashboardData?.leads_limit || 50}</span>
            </div>
            <div className="w-full bg-[#0B1220] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
                style={{
                  width: `${
                    ((dashboardData?.leads_used || 0) / (dashboardData?.leads_limit || 50)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all">
        Upgrade Plan
      </button>
    </div>
  );
}
