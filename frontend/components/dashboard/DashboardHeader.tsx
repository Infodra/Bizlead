'use client';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  title,
  subtitle,
  breadcrumbs = ['Dashboard'],
  userName = 'User',
  userEmail = '',
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-[#162338] to-[#0B1220] px-4 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span>/</span>}
              <span>{crumb}</span>
            </div>
          ))}
        </div>

        {/* Header Content */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {subtitle && <p className="text-[#94A3B8]">{subtitle}</p>}
          </div>

          {/* User Info */}
          <div className="text-right hidden lg:block">
            <p className="text-white font-medium">{userName}</p>
            <p className="text-sm text-[#94A3B8]">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
