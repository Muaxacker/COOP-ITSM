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
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Dispatch</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">Service Request Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">Branch Incidents & Requests</h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Track active tickets, review troubleshooting updates, and verify resolution closures.
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand-900 hover:bg-brand-800 font-semibold text-white text-xs shadow-subtle transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Report New Incident
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row gap-3">
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
            className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-subtle overflow-hidden">
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
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Incident #</th>
                  <th className="px-4 py-2.5">Title & Reported Date</th>
                  <th className="px-4 py-2.5">Division & Category</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Assigned Technician</th>
                  <th className="px-4 py-2.5">SLA Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5.5 font-mono font-bold text-sm text-slate-900">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(inc.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-semibold text-slate-700 block">{inc.category.name}</span>
                      {inc.category.division && (
                        <span className="text-xs text-slate-500 font-medium">{inc.category.division.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {inc.assignedTechnician ? (
                        <span className="font-medium text-slate-800">{inc.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
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

