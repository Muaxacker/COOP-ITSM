import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Layers,
  BarChart3,
  LogOut,
  Menu,
  X,
  Server,
  PlusCircle,
  Wrench,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils';
import { Role } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

function getNavItems(role: Role): NavItem[] {
  switch (role) {
    case 'BRANCH_USER':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Report IT Problem', to: '/incidents/new', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'My Incidents', to: '/incidents', icon: <FileText className="w-4 h-4" /> },
      ];
    case 'IT_SUPERVISOR':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'All Incidents', to: '/incidents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Operational Reports', to: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Audit Trail', to: '/audit-logs', icon: <Shield className="w-4 h-4" /> },
      ];
    case 'TECHNICIAN':
      return [
        { label: 'Workbench', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Assigned Incidents', to: '/incidents', icon: <Wrench className="w-4 h-4" /> },
        { label: 'Technician Workbench', to: '/dashboard', icon: <Wrench className="w-4 h-4" /> },
      ];
    case 'ADMIN':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'User Management', to: '/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Bank Branches', to: '/branches', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Divisions & Categories', to: '/divisions', icon: <Layers className="w-4 h-4" /> },
        { label: 'Operational Reports', to: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Audit Trail', to: '/audit-logs', icon: <Shield className="w-4 h-4" /> },
      ];
    default:
      return [];
  }
}

const ROLE_LABELS: Record<Role, string> = {
  BRANCH_USER: 'Branch Portal',
  IT_SUPERVISOR: 'IT Supervisor Desk',
  TECHNICIAN: 'Technician Workbench',
  ADMIN: 'System Administration',
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A101D] text-slate-200 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-md flex items-center justify-center flex-shrink-0 border border-slate-700/80 shadow-subtle text-slate-100">
            <Server className="w-4 h-4 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">COOP</span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">ITSM</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Cooperative Bank of Oromia</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60">
          {ROLE_LABELS[user.role]}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-colors duration-100',
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-subtle'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              )}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-slate-400')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-8 border-t border-slate-800/80 pt-3 space-y-2">
        {/* User Card with Avatar */}
        <div className="p-3 rounded-md bg-slate-900/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2.5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700/90 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
            </div>
          </div>
          {(user.branch || user.division) && (
            <div className="pt-1.5 border-t border-slate-800/60 text-xs text-slate-300 font-medium space-y-0.5">
              {user.branch && (
                <p className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {user.branch.name}
                </p>
              )}
              {user.division && (
                <p className="flex items-center gap-1.5 truncate">
                  <Layers className="w-3 h-3 text-slate-400" />
                  {user.division.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Prominent, Clearly Visible Sign Out Button with Generous Spacing */}
        <div className="pt-1">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/60 hover:text-white transition-all shadow-subtle"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-2.5 left-3 z-50 w-9 h-9 flex items-center justify-center bg-[#0B2545] rounded-md text-white shadow-md border border-slate-700/80 hover:bg-[#134074] transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-200 hidden md:block shadow-xl'
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 max-w-[85vw] z-50 transform transition-transform duration-200 md:hidden shadow-2xl bg-[#0A101D]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
