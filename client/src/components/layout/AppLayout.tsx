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
        <header className="h-11 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 shadow-subtle">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 tracking-tight">COOP-ITSM</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Enterprise Incident Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Core Infrastructure Online
            </div>
            <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">{today}</span>
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
