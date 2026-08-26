import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, AlertTriangle, Users, Settings,
  LogOut, Menu, X, Shield, Bell, ClipboardList
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
    case 'CUSTOMER':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'My Requests', to: '/requests', icon: <FileText className="w-4 h-4" /> },
        { label: 'New Request', to: '/requests/new', icon: <ClipboardList className="w-4 h-4" /> },
      ];
    case 'OFFICER':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Request Queue', to: '/requests', icon: <ClipboardList className="w-4 h-4" /> },
      ];
    case 'MANAGER':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'All Requests', to: '/requests', icon: <FileText className="w-4 h-4" /> },
        { label: 'Needs Attention', to: '/attention', icon: <AlertTriangle className="w-4 h-4" /> },
      ];
    case 'ADMIN':
      return [
        { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'User Management', to: '/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Service Rules', to: '/service-rules', icon: <Settings className="w-4 h-4" /> },
      ];
    default:
      return [];
  }
}

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer Portal',
  OFFICER: 'Officer Portal',
  MANAGER: 'Manager Portal',
  ADMIN: 'Admin Portal',
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const isCustomer = user.role === 'CUSTOMER';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">BankCare</p>
            <p className="text-xs text-primary-300">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal text-white'
                  : 'text-primary-300 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        <Link
          to="/notifications"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/notifications'
              ? 'bg-teal text-white'
              : 'text-primary-300 hover:bg-white/10 hover:text-white'
          )}
        >
          <span className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-primary-300 truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary rounded-lg text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-primary z-40 transform transition-transform duration-200',
        'hidden md:block'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-primary z-50 transform transition-transform duration-200 md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
