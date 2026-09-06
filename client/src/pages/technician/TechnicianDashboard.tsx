import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/ui/Badge';
import { Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Activity, CheckCircle } from 'lucide-react';
import { formatDateTime, formatTimeRemaining } from '../../utils';

export function TechnicianDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'technician'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const kpis = data?.kpis || { assignedTotal: 0, active: 0, resolved: 0, breachedSla: 0, approachingSla: 0 };
  const myIncidents = data?.myIncidents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Field Operations</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-600">
              {user?.division ? `${user.division.name} Workbench` : 'IT Technician Workbench'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Technician Incident Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic logs, active hardware/software remediations, and SLA tracking for {user?.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-brand-900 text-white hover:bg-brand-800 transition-colors shadow-subtle"
          >
            All Incidents
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SLA Alert Banner if any breached or approaching */}
      {(kpis.breachedSla > 0 || kpis.approachingSla > 0) && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-lg flex items-center justify-between text-xs text-amber-900 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-semibold text-amber-950">SLA Operational Advisory: </span>
              {kpis.breachedSla > 0 && (
                <span className="font-semibold text-rose-700 mr-2">
                  {kpis.breachedSla} ticket{kpis.breachedSla === 1 ? '' : 's'} past resolution deadline.
                </span>
              )}
              {kpis.approachingSla > 0 && (
                <span className="text-amber-800">
                  {kpis.approachingSla} ticket{kpis.approachingSla === 1 ? '' : 's'} approaching SLA (&lt; 2 hours remaining).
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Tasks</span>
            <Wrench className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.assignedTotal}</p>
          <p className="text-[11px] text-slate-400 mt-1">Assigned to your queue</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Active In-Progress</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.active}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Under active diagnosis</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.resolved}</p>
          <p className="text-[11px] text-slate-500 mt-1">Completed resolutions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200/70 bg-amber-50/20 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Due Soon</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-2">{kpis.approachingSla}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">&lt; 2h remaining</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-rose-200/70 bg-rose-50/20 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Breached SLA</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2">{kpis.breachedSla}</p>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">Overdue deadline</p>
        </div>
      </div>

      {/* Active Work Queue */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">My Assigned Incident Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Priority-ranked technical incidents awaiting diagnostic steps and resolution.
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            All tickets <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading queue...</div>
        ) : myIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Queue is clear</p>
            <p className="text-xs text-slate-400 mt-0.5">No pending assigned incidents currently require remediation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Incident #</th>
                  <th className="px-4 py-2.5 font-medium">Branch & Location</th>
                  <th className="px-4 py-2.5 font-medium">Problem Title</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">SLA Target</th>
                  <th className="px-4 py-2.5 font-medium text-right">Workbench</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myIncidents.map((inc: any) => {
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        <Link to={`/incidents/${inc.id}`} className="hover:text-brand-700 hover:underline">
                          {inc.incidentNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="font-medium text-slate-900 block">{inc.branch?.name}</span>
                        <span className="text-slate-400 text-[11px]">{inc.branch?.location}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <p className="font-medium text-slate-900 truncate">{inc.title}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Category: <span className="font-medium text-slate-600">{inc.category?.name}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={inc.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3">
                        <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded transition-colors shadow-subtle"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Troubleshoot
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
