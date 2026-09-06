import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../services/api';
import { PriorityBadge } from '../../components/ui/Badge';
import { BarChart3, Building2, Layers, Wrench, Clock, CheckCircle2 } from 'lucide-react';

export function SupervisorReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportApi.getReports();
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Generating operational reports...</div>;
  }

  const byDivision = data?.byDivision || [];
  const byBranch = data?.byBranch || [];
  const byCategory = data?.byCategory || [];
  const byPriority = data?.byPriority || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const technicianPerformance = data?.technicianPerformance || [];
  const avgResolutionHours = data?.overallAvgResolutionHours || 0;

  const totalIncidents = byDivision.reduce((sum: number, d: any) => sum + d.totalIncidents, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Analytics & Governance</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">Tier-2 Performance Telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">Operational Analytics & Reports</h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Regional branch incident volume, division workload distribution, and technician turnaround telemetry.
          </p>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Incidents Recorded</span>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">{totalIncidents}</p>
          <p className="text-xs text-slate-400 mt-1">Across 8 bank branches</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase">Average Resolution Time</span>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {avgResolutionHours > 0 ? `${avgResolutionHours}h` : 'N/A'}
          </p>
          <p className="text-xs text-emerald-600 mt-1">From assignment to fix verification</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Technical Specialists</span>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">{technicianPerformance.length}</p>
          <p className="text-xs text-indigo-600 mt-1">ATM, App, Network, Maintenance</p>
        </div>
      </div>

      {/* Division Breakdown & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Incidents by Technical IT Division</h3>
          </div>
          <div className="space-y-3 pt-2">
            {byDivision.map((div: any) => {
              const percent = totalIncidents > 0 ? Math.round((div.totalIncidents / totalIncidents) * 100) : 0;
              return (
                <div key={div.divisionId} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{div.name}</span>
                    <span className="text-slate-600">
                      {div.totalIncidents} ({percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Incidents by Urgency & Priority</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-rose-50/40 border border-rose-200/70 rounded-md">
              <span className="text-xs font-bold text-red-700 block">CRITICAL</span>
              <p className="text-xl font-bold font-mono text-red-900 mt-1">{byPriority.CRITICAL}</p>
              <span className="text-xs font-semibold text-red-600">Major bank disruption (1h SLA)</span>
            </div>

            <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-md">
              <span className="text-xs font-bold text-orange-700 block">HIGH</span>
              <p className="text-xl font-bold font-mono text-orange-900 mt-1">{byPriority.HIGH}</p>
              <span className="text-xs font-semibold text-orange-600">Important service affected (4h SLA)</span>
            </div>

            <div className="p-3 bg-amber-50/20 border border-amber-200/60 rounded-md">
              <span className="text-xs font-bold text-amber-700 block">MEDIUM</span>
              <p className="text-xl font-bold font-mono text-amber-900 mt-1">{byPriority.MEDIUM}</p>
              <span className="text-xs font-semibold text-amber-600">Limited impact (24h SLA)</span>
            </div>

            <div className="p-3 bg-emerald-50/30 border border-emerald-200/60 rounded-md">
              <span className="text-xs font-bold text-emerald-700 block">LOW</span>
              <p className="text-xl font-bold font-mono text-emerald-900 mt-1">{byPriority.LOW}</p>
              <span className="text-xs font-semibold text-emerald-600">Minor request (72h SLA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents by Branch & Most Common Problem Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Branch */}
        <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Branch Incident Distribution</h3>
          </div>
          <div className="space-y-2.5 pt-1">
            {byBranch.map((b: any) => (
              <div key={b.branchId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{b.name}</span>
                  <span className="text-xs text-slate-500 font-medium block">{b.location} ({b.code})</span>
                </div>
                <span className="font-extrabold text-sm text-blue-700 px-2.5 py-1 bg-white rounded-md border border-slate-200">
                  {b.totalIncidents} ticket{b.totalIncidents === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Problem Categories */}
        <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Most Common IT Incident Categories</h3>
          </div>
          <div className="space-y-2.5 pt-1">
            {byCategory.map((c: any, index: number) => (
              <div key={c.categoryId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-xs text-slate-500 font-medium block">{c.divisionName}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-700">
                  {c.totalIncidents} incident{c.totalIncidents === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technician Workload & Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Technician Workload & Resolution Metrics</h3>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Assigned load, active cases, resolution throughput, and average turnaround time
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Technician</th>
                <th className="px-4 py-2.5">Division</th>
                <th className="px-4 py-2.5 text-center">Total Assigned</th>
                <th className="px-4 py-2.5 text-center">Active Load</th>
                <th className="px-4 py-2.5 text-center">Resolved</th>
                <th className="px-4 py-2.5 text-center">SLA Breached</th>
                <th className="px-4 py-2.5 text-right">Avg Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicianPerformance.map((tech: any) => (
                <tr key={tech.technicianId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5.5">
                    <span className="font-bold text-xs text-slate-800 block">{tech.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{tech.email}</span>
                  </td>
                  <td className="px-4 py-2.5.5 text-xs font-medium text-slate-600">
                    {tech.division}
                  </td>
                  <td className="px-4 py-2.5.5 text-center font-bold text-xs text-slate-800">
                    {tech.totalAssigned}
                  </td>
                  <td className="px-4 py-2.5.5 text-center">
                    <span className="px-2 py-0.5 rounded px-2 py-0.5 text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {tech.active}
                    </span>
                  </td>
                  <td className="px-4 py-2.5.5 text-center">
                    <span className="px-2 py-0.5 rounded px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tech.resolved}
                    </span>
                  </td>
                  <td className="px-4 py-2.5.5 text-center font-bold text-xs">
                    {tech.breached > 0 ? (
                      <span className="text-red-600">{tech.breached}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5.5 text-right font-semibold text-xs text-blue-700">
                    {tech.avgResolutionHours > 0 ? `${tech.avgResolutionHours} hours` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

