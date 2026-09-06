import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { incidentApi, branchApi, divisionApi, userApi } from '../../services/api';
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Wrench, ArrowRight, UserCheck, Edit3 } from 'lucide-react';
import { formatDateTime } from '../../utils';
import { IncidentStatus, Priority, DivisionCode, Incident } from '../../types';
import toast from 'react-hot-toast';

export function AllIncidentsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [divisionId, setDivisionId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [page, setPage] = useState(1);

  // Assign Technician Modal State
  const [assignModalIncident, setAssignModalIncident] = useState<Incident | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Review / Prioritize Modal State
  const [reviewModalIncident, setReviewModalIncident] = useState<Incident | null>(null);
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [reviewNotes, setReviewNotes] = useState('');

  // Incidents Query
  const { data, isLoading } = useQuery({
    queryKey: ['all-incidents', { search, status, priority, divisionId, branchId, page }],
    queryFn: async () => {
      const res = await incidentApi.getIncidents({
        search: search.trim() || undefined,
        status: (status as IncidentStatus) || undefined,
        priority: (priority as Priority) || undefined,
        divisionId: divisionId || undefined,
        branchId: branchId || undefined,
        page,
        limit: 15,
      });
      return res.data.data;
    },
  });

  // Branches Query
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await branchApi.getBranches()).data.data,
  });

  // Divisions Query
  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => (await divisionApi.getDivisions()).data.data,
  });

  // Technicians Query (for assignment)
  const { data: technicians } = useQuery({
    queryKey: ['technicians', assignModalIncident?.category.division?.code],
    queryFn: async () => (await userApi.getTechnicians()).data.data,
  });

  // Assign Mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      return incidentApi.assignTechnician(
        assignModalIncident!.id,
        selectedTechId,
        assignNotes.trim() || undefined
      );
    },
    onSuccess: () => {
      toast.success('Technician assigned successfully!');
      setAssignModalIncident(null);
      setSelectedTechId('');
      setAssignNotes('');
      queryClient.invalidateQueries({ queryKey: ['all-incidents'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      return incidentApi.reviewIncident(reviewModalIncident!.id, {
        priority: newPriority,
        notes: reviewNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Incident priority reviewed and updated!');
      setReviewModalIncident(null);
      setReviewNotes('');
      queryClient.invalidateQueries({ queryKey: ['all-incidents'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Review update failed');
    },
  });

  const incidents = data?.incidents || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Branch Incidents</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review requests, categorize, prioritize, and assign technical personnel
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by incident number, title, description, or branch..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={divisionId}
              onChange={(e) => {
                setDivisionId(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Divisions</option>
              {divisions?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open (Review Required)</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_INFO">Waiting for Info</option>
              <option value="RESOLVED">Resolved</option>
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
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading all incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-semibold text-slate-700">No incidents found matching filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Incident #</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Division & Category</th>
                  <th className="px-5 py-3">Problem Title</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3">SLA</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-blue-600">
                      {inc.incidentNumber}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                      {inc.branch?.name}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <DivisionBadge
                        code={inc.category.division?.code}
                        name={inc.category.division?.name}
                      />
                      <span className="text-[11px] text-slate-600 block mt-1 font-medium">
                        {inc.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.title}</p>
                      <p className="text-[11px] text-slate-400">{formatDateTime(inc.createdAt)}</p>
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
                        <button
                          onClick={() => {
                            setAssignModalIncident(inc);
                            setSelectedTechId('');
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                        >
                          + Assign Tech
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <SlaBadge deadline={inc.slaDeadline} breached={inc.slaBreached} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setReviewModalIncident(inc);
                            setNewPriority(inc.priority);
                          }}
                          title="Review & Change Priority"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAssignModalIncident(inc);
                            setSelectedTechId(inc.assignedTechnicianId || '');
                          }}
                          title="Assign / Reassign Technician"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors"
                        >
                          Details
                        </Link>
                      </div>
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total incidents)
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

      {/* Assign Technician Modal */}
      {assignModalIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Technician: {assignModalIncident.incidentNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Select available technical specialist for this incident
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Technician & Current Workload
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choose Technician --</option>
                {technicians?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.division?.name || 'General'}) — Active Load: {t.activeWorkload} ticket{t.activeWorkload === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor Assignment Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please check the switch cable connection first."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setAssignModalIncident(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedTechId) {
                    toast.error('Please select a technician');
                    return;
                  }
                  assignMutation.mutate();
                }}
                loading={assignMutation.isPending}
                className="bg-blue-600 text-white font-semibold"
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review / Change Priority Modal */}
      {reviewModalIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Edit3 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Incident Priority: {reviewModalIncident.incidentNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust urgency and target SLA resolution timeline
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CRITICAL">🔴 Critical (1 Hour SLA - Major service disruption)</option>
                <option value="HIGH">🟠 High (4 Hours SLA - Important service affected)</option>
                <option value="MEDIUM">🟡 Medium (1 Business Day - Limited impact)</option>
                <option value="LOW">🟢 Low (3 Business Days - Non-urgent request)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor Review Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Upgraded to Critical due to entire branch ATM unavailability."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setReviewModalIncident(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => reviewMutation.mutate()}
                loading={reviewMutation.isPending}
                className="bg-blue-600 text-white font-semibold"
              >
                Save Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

