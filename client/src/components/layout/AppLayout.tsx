import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Layers,
} from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Top Operational Utility Bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 pl-14 pr-3 sm:pr-6 md:px-6 flex items-center justify-between text-sm text-slate-600 shadow-subtle sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 tracking-tight">COOP-ITSM</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600 font-semibold hidden sm:inline">Enterprise Incident Operations</span>
          </div>

          {/* Top-Right Utility Cluster: Infrastructure Status, Date, Notifications, and Profile */}
          <div className="flex items-center gap-3">
            {/* Core Infrastructure Health Status */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-900 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 animate-pulse" />
              Core Infrastructure Online
            </div>

            {/* Date Badge */}
            <span className="font-mono text-xs text-slate-600 font-semibold hidden md:inline px-2 py-1 bg-slate-50 rounded border border-slate-200">
              {today}
            </span>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden md:block" />

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Avatar & Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left group"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-brand-900">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {user.role?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform" />
                </button>

                {/* Profile Card & Actions Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* User Card */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                            {user.role?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {(user.branch || user.division) && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600 font-medium space-y-0.5">
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

                    {/* Navigation Menu Links */}
                    <div className="p-1 space-y-0.5 text-xs font-medium">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-slate-500" />
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold font-mono">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="p-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-5 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
