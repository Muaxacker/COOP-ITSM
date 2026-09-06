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
    <div className="flex flex-col h-full bg-[#0b2545] text-white">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">COOP</span>
              <span className="font-semibold text-xs px-1.5 py-0.5 bg-blue-500/30 text-blue-200 rounded border border-blue-400/30">ITSM</span>
            </div>
            <p className="text-[11px] text-blue-200/80 font-medium">Cooperative Bank of Oromia</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-blue-100">
          {ROLE_LABELS[user.role]}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100/75 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <Link
          to="/notifications"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/notifications'
              ? 'bg-blue-600 text-white'
              : 'text-blue-100/75 hover:bg-white/10 hover:text-white'
          )}
        >
          <span className="flex items-center gap-2.5">
            <Bell className="w-4 h-4" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[11px] rounded-full px-1.5 py-0.2 min-w-[20px] text-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="px-3 py-2 rounded-lg bg-black/20">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <p className="text-[11px] text-blue-200/70 truncate">{user.email}</p>
          {user.branch && (
            <p className="text-[10px] text-emerald-300 font-medium mt-0.5 truncate">
              📍 {user.branch.name}
            </p>
          )}
          {user.division && (
            <p className="text-[10px] text-amber-300 font-medium mt-0.5 truncate">
              ⚙️ {user.division.name}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
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
