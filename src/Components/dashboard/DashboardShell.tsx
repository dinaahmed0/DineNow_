import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUserTie } from 'react-icons/fa';
import { APP_ROUTES } from '../../constants/routes';

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  userName?: string;
  onLogout?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}

export default function DashboardShell({
  title,
  subtitle,
  badge,
  userName,
  onLogout,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            {badge && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#6B8A62] bg-[#6B8A62]/10 px-3 py-1 rounded-full mb-2">
                {badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 mt-1 text-sm md:text-base">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            {userName && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm">
                <FaUserTie className="text-[#6B8A62]" />
                {userName}
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            )}
            <Link
              to={APP_ROUTES.home}
              className="text-sm text-[#6B8A62] hover:underline font-medium"
            >
              Back to site
            </Link>
          </div>
        </header>

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'emerald',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'emerald' | 'amber' | 'blue' | 'rose';
}) {
  const accents = {
    emerald: { text: 'text-[#6B8A62]', bg: 'bg-[#6B8A62]/10' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50' },
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accents[accent].text}`}>{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${accents[accent].bg} ${accents[accent].text}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
