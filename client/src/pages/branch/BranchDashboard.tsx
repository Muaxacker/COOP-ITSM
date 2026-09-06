import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from '../../components/ui/Badge';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Building2,
  Layers,
  Activity,
} from 'lucide-react';
import { formatDateTime } from '../../utils';

export function BranchDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'branch'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const kpis = data?.kpis || { total: 0, open: 0, active: 0, resolved: 0, closed: 0 };
  const recentIncidents = data?.recentIncidents || [];

  return (
    <div className="space-y-6">
      {/* Operational Command Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider uppercase px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
              Branch Service Portal
            </span>
            {user?.branch && (
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                {user.branch.name} ({user.branch.code})
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Operational Overview
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Centralized technical incident dispatching and resolution verification for branch workstations.
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0B2545] hover:bg-[#134074] font-bold text-white text-sm shadow-subtle transition-colors flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Report Technical Issue
        </Link>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Reported</span>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums mt-1.5">{kpis.total}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">All branch tickets</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Under Review</span>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums mt-1.5">{kpis.open}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Awaiting supervisor dispatch</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Active Investigation</span>
          <p className="text-3xl font-extrabold text-amber-950 tracking-tight font-mono tabular-nums mt-1.5">{kpis.active}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Assigned to technician</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 shadow-subtle">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Pending Verification</span>
          <p className="text-3xl font-extrabold text-emerald-950 tracking-tight font-mono tabular-nums mt-1.5">{kpis.resolved}</p>
          <p className="text-xs text-emerald-900 font-semibold mt-1">Requires branch sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Closed & Verified</span>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono tabular-nums mt-1.5">{kpis.closed}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Successfully resolved</p>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Branch Incidents</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Live tracking of service requests filed from this branch</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            Full Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm font-mono">Loading branch incidents...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <p className="font-semibold">No incidents logged for this branch</p>
            <p className="text-slate-400 text-xs mt-1">Use "Report Technical Issue" above to submit a ticket.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ticket #</th>
                  <th className="px-4 py-3">Summary & Problem</th>
                  <th className="px-4 py-3">Division / Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">SLA Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-sm text-slate-900">
                      <Link to={`/incidents/${inc.id}`} className="hover:text-brand-700 hover:underline">
                        {inc.incidentNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <p className="font-bold text-slate-900 truncate">{inc.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{formatDateTime(inc.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 block text-xs">{inc.category?.name}</span>
                      {inc.category?.division && (
                        <span className="text-xs text-slate-500 font-medium">{inc.category.division.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-800 font-semibold">
                      {inc.assignedTechnician?.name ? (
                        <span>{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Awaiting Assignment</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {inc.status === 'RESOLVED' ? (
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-subtle transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify Fix
                        </Link>
                      ) : (
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shadow-subtle transition-colors"
                        >
                          Details
                        </Link>
                      )}
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
