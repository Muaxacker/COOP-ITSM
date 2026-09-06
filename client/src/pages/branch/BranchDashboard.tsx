import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { PlusCircle, ArrowRight, Building2 } from "lucide-react";
import { formatDateTime } from "../../utils";

export function BranchDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "branch"],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const kpis = data?.kpis || { total: 0, open: 0, active: 0, resolved: 0, closed: 0 };
  const recentIncidents = data?.recentIncidents || [];

  return (
    <div className="space-y-5">
      {/* Operational Command Header */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium tracking-wider uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              Branch Service Portal
            </span>
            {user?.branch && (
              <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {user.branch.name} ({user.branch.code})
              </span>
            )}
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight mt-1.5">
            Operational Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized technical incident dispatching and resolution verification for branch workstations
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#0B2545] hover:bg-[#134074] font-semibold text-white text-xs shadow-subtle transition-colors flex-shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Report Technical Issue
        </Link>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Reported</span>
          <p className="text-xl font-semibold text-slate-900 tracking-tight font-mono tabular-nums mt-1">{kpis.total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All branch tickets</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Under Review</span>
          <p className="text-xl font-semibold text-slate-900 tracking-tight font-mono tabular-nums mt-1">{kpis.open}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting supervisor dispatch</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle">
          <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">Active Investigation</span>
          <p className="text-xl font-semibold text-amber-950 tracking-tight font-mono tabular-nums mt-1">{kpis.active}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Assigned to technician</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 bg-emerald-50/20 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">Pending Verification</span>
          <p className="text-xl font-semibold text-emerald-950 tracking-tight font-mono tabular-nums mt-1">{kpis.resolved}</p>
          <p className="text-[10px] text-emerald-800 font-medium mt-0.5">Requires branch sign-off</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Closed & Verified</span>
          <p className="text-xl font-semibold text-slate-700 tracking-tight font-mono tabular-nums mt-1">{kpis.closed}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Successfully resolved</p>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Recent Branch Incidents</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Live tracking of service requests filed from this branch</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading branch incidents...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <p className="font-medium">No incidents logged for this branch</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Use \"Report Technical Issue\" above to submit a ticket.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 text-[11px] uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5">Ticket #</th>
                  <th className="px-4 py-2.5">Summary & Problem</th>
                  <th className="px-4 py-2.5">Division / Category</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Assigned Specialist</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIncidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-4 py-2.5 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{inc.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatDateTime(inc.createdAt)}</p>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{inc.category?.name}</span>
                      {inc.category?.division && (
                        <span className="text-[10px] text-slate-500 block font-normal">
                          {inc.category.division.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                      {inc.assignedTechnician ? (
                        <span className="font-medium text-slate-900">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded border border-slate-200 transition-colors"
                      >
                        Inspect
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
