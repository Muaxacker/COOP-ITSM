import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { incidentApi } from '../../services/api';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/ui/Badge';
import { Search, Filter, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils';
import { IncidentStatus, Priority } from '../../types';

export function MyIncidentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-incidents', { search, status, priority, page }],
    queryFn: async () => {
      const res = await incidentApi.getIncidents({
        search: search.trim() || undefined,
        status: (status as IncidentStatus) || undefined,
        priority: (priority as Priority) || undefined,
        page,
        limit: 15,
      });
      return res.data.data;
    },
  });

  const incidents = data?.incidents || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Incidents & Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, review, and confirm resolution of IT problems submitted from your branch
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white text-sm shadow-sm transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Incident
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by incident number, title, or keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open (Under Review)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_INFO">Waiting for Info</option>
            <option value="RESOLVED">Resolved (Verify Fix)</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading branch incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No incidents found matching criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Incident #</th>
                  <th className="px-5 py-3">Title & Reported Date</th>
                  <th className="px-5 py-3">Division & Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned Technician</th>
                  <th className="px-5 py-3">SLA Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-blue-600">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(inc.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span className="font-semibold text-slate-700 block">{inc.category.name}</span>
                      {inc.category.division && (
                        <span className="text-[11px] text-slate-500">{inc.category.division.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {inc.assignedTechnician ? (
                        <span className="font-medium text-slate-800">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} incidents)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

