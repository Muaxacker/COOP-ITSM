import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/ui/Badge';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-900 to-[#0b2545] p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-blue-200 uppercase tracking-wider">
            Branch IT Service Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">
            Welcome, {user?.name} 👋
          </h1>
          <p className="text-sm text-blue-200 mt-0.5">
            {user?.branch ? `Branch: ${user.branch.name} (${user.branch.code})` : 'Report and track branch technical problems'}
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Report IT Problem
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Reported</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">{kpis.total}</p>
          <p className="text-xs text-slate-400 mt-1">All branch tickets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">Open</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{kpis.open}</p>
          <p className="text-xs text-slate-400 mt-1">Under review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">Active</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{kpis.active}</p>
          <p className="text-xs text-slate-400 mt-1">Investigating / Assigned</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-700 mt-2">{kpis.resolved}</p>
          <p className="text-xs text-teal-600 mt-1 font-medium">Needs your confirmation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Closed</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-700 mt-2">{kpis.closed}</p>
          <p className="text-xs text-slate-400 mt-1">Completed & verified</p>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Branch Incidents</h3>
            <p className="text-xs text-slate-500 mt-0.5">Track live progress of IT requests from your branch</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading branch incidents...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <p className="text-sm font-medium">No incidents reported yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Report IT Problem" when hardware or software fails.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Incident #</th>
                  <th className="px-5 py-3">Title & Problem</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-xs text-blue-600">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(inc.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <span className="font-medium text-slate-700">{inc.category?.name}</span>
                      {inc.category?.division && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {inc.category.division.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {inc.assignedTechnician ? (
                        <span className="font-medium text-slate-700">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors"
                      >
                        View
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

