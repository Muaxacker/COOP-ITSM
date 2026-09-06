import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Top Operational Utility Bar */}
        <header className="h-12 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between text-sm text-slate-600 shadow-subtle">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 tracking-tight">COOP-ITSM</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-semibold">Enterprise Incident Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
              Core Infrastructure Online
            </div>
            <span className="font-mono text-xs text-slate-600 font-semibold hidden sm:inline">{today}</span>
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
