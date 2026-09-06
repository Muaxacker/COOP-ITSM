import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/ui/Badge';
import {
  Layers,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Landmark,
  MonitorCheck,
  Network,
  Wrench,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { formatDateTime } from '../../utils';

export function SupervisorDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'supervisor'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const kpis = data?.kpis || { total: 0, open: 0, active: 0, critical: 0, breached: 0 };
  const incidentsByDivision = data?.incidentsByDivision || [];
  const recentIncidents = data?.recentIncidents || [];

  const getDivisionIcon = (code: string) => {
    switch (code) {
      case 'ATM':
        return <Landmark className="w-4 h-4 text-slate-700" />;
      case 'APPLICATION':
        return <MonitorCheck className="w-4 h-4 text-slate-700" />;
      case 'NETWORKING':
        return <Network className="w-4 h-4 text-slate-700" />;
      case 'MAINTENANCE':
        return <Wrench className="w-4 h-4 text-slate-700" />;
      default:
        return <Server className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operational Command</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-500">Tier-2 Incident Control</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">IT Operations & Oversight</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time branch incident monitoring, division workload distribution, and SLA compliance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-brand-900 text-white hover:bg-brand-800 transition-colors shadow-subtle"
          >
            Review All Incidents
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Incidents</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all branches</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Open / New</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.open}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Awaiting supervisor review</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Active Working</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{kpis.active}</p>
          <p className="text-[11px] text-slate-500 mt-1">Assigned & in-progress</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-rose-200/70 bg-rose-50/20 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2">{kpis.critical}</p>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">High-severity triage</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-rose-200/70 bg-rose-50/20 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">SLA Breached</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2">{kpis.breached}</p>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">Exceeded target resolution</p>
        </div>
      </div>

      {/* Incidents by Division (The 4 Technical Areas) */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Workload by Technical IT Division</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Incident distribution across ATM, Core Applications, Networking, and Infrastructure Maintenance.
            </p>
          </div>
          <Link to="/reports" className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            View Analytics
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {incidentsByDivision.map((div: any) => {
            const percent = kpis.total > 0 ? Math.round((div.count / kpis.total) * 100) : 0;

            return (
              <div
                key={div.divisionId}
                className="p-4 rounded-md border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center shadow-subtle">
                      {getDivisionIcon(div.code)}
                    </div>
                    <span className="text-lg font-bold font-mono text-slate-900">{div.count}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-3">{div.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="h-1.5 w-full bg-slate-200/70 rounded overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-medium">
                    <span className="font-mono">{percent}% load</span>
                    <Link
                      to={`/incidents?divisionId=${div.divisionId}`}
                      className="text-brand-700 hover:text-brand-900 hover:underline font-semibold"
                    >
                      Filter incidents →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Incident Operations Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent Incident Triage Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming tickets, verify priority categorizations, and assign division technicians.
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            Manage all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading incident queue...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No active incidents currently logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Incident #</th>
                  <th className="px-4 py-2.5 font-medium">Branch</th>
                  <th className="px-4 py-2.5 font-medium">Title & Category</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Assigned Technician</th>
                  <th className="px-4 py-2.5 font-medium">SLA Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      <Link to={`/incidents/${inc.id}`} className="hover:text-brand-700 hover:underline">
                        {inc.incidentNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {inc.branch?.name}
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <p className="font-medium text-slate-900 truncate">{inc.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {inc.category?.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {inc.assignedTechnician ? (
                        <span className="font-medium text-slate-800">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
