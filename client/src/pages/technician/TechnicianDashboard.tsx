import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from '../../components/ui/Badge';
import { Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
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
  const divisionOpen = data?.divisionOpen || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-[#0b2545] p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-xs font-semibold text-blue-200">
            <Wrench className="w-3.5 h-3.5" />
            {user?.division ? `${user.division.name} Workbench` : 'IT Technician Workbench'}
          </div>
          <h1 className="text-2xl font-bold mt-2">Welcome, {user?.name}</h1>
          <p className="text-xs text-blue-200/80 mt-1">
            Investigate, troubleshoot, and resolve technical incidents across bank branches
          </p>
        </div>
      </div>

      {/* SLA Alert Banner if any breached or approaching */}
      {(kpis.breachedSla > 0 || kpis.approachingSla > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">SLA Notice: </span>
              {kpis.breachedSla > 0 && (
                <span className="font-semibold text-red-600 mr-2">
                  {kpis.breachedSla} ticket{kpis.breachedSla === 1 ? '' : 's'} breached SLA deadline!
                </span>
              )}
              {kpis.approachingSla > 0 && (
                <span className="text-amber-800">
                  {kpis.approachingSla} ticket{kpis.approachingSla === 1 ? '' : 's'} expiring within 2 hours.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assigned to Me</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">{kpis.assignedTotal}</p>
          <p className="text-xs text-slate-400 mt-1">Total assigned tasks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase">Active Work</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">{kpis.active}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Under active diagnosis</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{kpis.resolved}</p>
          <p className="text-xs text-emerald-600 mt-1">Completed resolutions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">Due Soon</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{kpis.approachingSla}</p>
          <p className="text-xs text-slate-400 mt-1">&lt; 2h remaining</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase">Breached SLA</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-2">{kpis.breachedSla}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">Overdue deadline</p>
        </div>
      </div>

      {/* Active Work Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">My Active Incident Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Priority-ranked technical incidents assigned to you
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            All tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading queue...</div>
        ) : myIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Queue is clear!</p>
            <p className="text-xs text-slate-400 mt-1">No pending assigned incidents at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Incident #</th>
                  <th className="px-5 py-3">Branch & Location</th>
                  <th className="px-5 py-3">Problem Title</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">SLA Target</th>
                  <th className="px-5 py-3 text-right">Workbench</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myIncidents.map((inc: any) => {
                  const slaInfo = formatTimeRemaining(inc.slaDeadline);
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-xs text-blue-600">
                        {inc.incidentNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="font-semibold text-slate-800 block">{inc.branch?.name}</span>
                        <span className="text-slate-400 text-[11px]">{inc.branch?.location}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Category: <span className="font-medium text-slate-600">{inc.category?.name}</span>
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={inc.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
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

