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
  Bell,
  PlusCircle,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
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
      ];
    case 'TECHNICIAN':
      return [
        { label: 'Workbench', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Assigned Incidents', to: '/incidents', icon: <Wrench className="w-4 h-4" /> },
      ];
    case 'ADMIN':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'User Management', to: '/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Bank Branches', to: '/branches', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Divisions & Categories', to: '/divisions', icon: <Layers className="w-4 h-4" /> },
        { label: 'Operational Reports', to: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
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
  const { unreadCount } = useNotifications();
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
              <span className="font-semibold text-sm tracking-tight text-white">COOP</span>
              <span className="font-mono text-[10px] font-medium px-1 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">ITSM</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Cooperative Bank of Oromia</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60">
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
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-100',
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
      <div className="px-2.5 pb-3 border-t border-slate-800/80 pt-2.5 space-y-1">
        <Link
          to="/notifications"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-100',
            location.pathname === '/notifications'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          )}
        >
          <span className="flex items-center gap-2.5">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-rose-900/60 text-rose-200 border border-rose-700/80 text-[10px] rounded px-1.5 py-0.2 font-mono font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="px-3 py-2 rounded-md bg-slate-900/80 border border-slate-800/60">
          <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          {user.branch && (
            <p className="text-[10px] text-slate-300 font-medium mt-1 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 text-slate-400" />
              {user.branch.name}
            </p>
          )}
          {user.division && (
            <p className="text-[10px] text-slate-300 font-medium mt-1 flex items-center gap-1 truncate">
              <Layers className="w-3 h-3 text-slate-400" />
              {user.division.name}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors duration-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0b2545] rounded-lg text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
          'fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-200 md:hidden shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
