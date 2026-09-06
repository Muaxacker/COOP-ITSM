import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from '../../components/ui/Badge';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Building2,
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
  const incidentsByStatus = data?.incidentsByStatus || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-[#0b2545] p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-blue-200 uppercase tracking-wider">
            IT Operations & Incident Control
          </span>
          <h1 className="text-2xl font-bold mt-2">ITSM Executive Dashboard</h1>
          <p className="text-xs text-blue-200/80 mt-1">
            Real-time branch incident monitoring, division workload, and SLA compliance
          </p>
        </div>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-lg transition-all"
        >
          Review All Incidents
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Incidents</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">{kpis.total}</p>
          <p className="text-xs text-slate-400 mt-1">Across all 8 branches</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">Open / New</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-700 mt-2">{kpis.open}</p>
          <p className="text-xs text-blue-600 mt-1 font-medium">Awaiting supervisor review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase">Active Working</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">{kpis.active}</p>
          <p className="text-xs text-amber-600 mt-1">In progress & assigned</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase">Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-700 mt-2">{kpis.critical}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">Immediate action</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase">SLA Breached</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{kpis.breached}</p>
          <p className="text-xs text-rose-500 mt-1 font-medium">Exceeded target time</p>
        </div>
      </div>

      {/* Incidents by Division (The 4 Technical Areas) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Incidents by Technical IT Division</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workload distribution across ATM, Application, Networking, and Maintenance divisions
            </p>
          </div>
          <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {incidentsByDivision.map((div: any) => {
            const icons: Record<string, string> = {
              ATM: '🏧',
              APPLICATION: '💻',
              NETWORKING: '🌐',
              MAINTENANCE: '🔧',
            };
            const barColors: Record<string, string> = {
              ATM: 'bg-cyan-500',
              APPLICATION: 'bg-violet-500',
              NETWORKING: 'bg-blue-600',
              MAINTENANCE: 'bg-emerald-500',
            };
            const percent = kpis.total > 0 ? Math.round((div.count / kpis.total) * 100) : 0;

            return (
              <div
                key={div.divisionId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{icons[div.code] || '⚙️'}</span>
                  <span className="text-xl font-extrabold text-slate-800">{div.count}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-3">{div.name}</h4>
                <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColors[div.code] || 'bg-blue-600'} rounded-full`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                  <span>{percent}% of incidents</span>
                  <Link to={`/incidents?divisionId=${div.divisionId}`} className="text-blue-600 hover:underline">
                    Filter
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Incident Operations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Bank Incidents</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review new requests, check categorization, set priority, and assign technicians
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading incident operations...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No recent incidents.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Incident #</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Title & Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned Technician</th>
                  <th className="px-5 py-3">SLA Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-xs text-blue-600">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-800">
                      {inc.branch?.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {inc.category?.name}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700">
                      {inc.assignedTechnician ? (
                        <span className="font-medium">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Needs Assignment</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
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

