import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { getRequests } from '../../services/request.service';
import { RequestStatus, Priority } from '../../types';
import { StatusBadge, PriorityBadge, DeadlineStatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { formatDate, formatTimeRemaining, getDeadlineStatus, cn } from '../../utils';

const STATUS_TABS: Array<{ label: string; value?: RequestStatus }> = [
  { label: 'All' },
  { label: 'New', value: 'NEW' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Investigating', value: 'INVESTIGATING' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Resolved', value: 'RESOLVED' },
];

export function RequestQueuePage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');

  const status = STATUS_TABS.find(t => t.label === activeTab)?.value;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests', 'officer-queue', activeTab, debouncedSearch, priority],
    queryFn: () => getRequests({
      status,
      search: debouncedSearch || undefined,
      priority: priority || undefined,
      limit: 50,
    }),
  });

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as any)._sq);
    (window as any)._sq = setTimeout(() => setDebouncedSearch(val), 400);
  }

  const requests = data?.requests || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Request Queue</h1>
        <p className="text-sm text-text-muted mt-0.5">{data?.total ?? 0} total requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by ID, title, or customer..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority | '')}
              className="h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 appearance-none"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
              activeTab === tab.label
                ? 'border-teal text-teal'
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState title="No requests found" description="Adjust your filters to see more requests." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Request</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Officer</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => {
                const ds = req.deadlineStatus ?? getDeadlineStatus(req.deadline, req.createdAt);
                const isActive = !['RESOLVED', 'CLOSED'].includes(req.status);
                return (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-text-muted">{req.requestNumber}</p>
                      <p className="font-medium text-text-primary line-clamp-1 mt-0.5">{req.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{req.category.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-medium text-text-primary">{req.customer.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {isActive ? (
                        <div>
                          <p className="text-xs text-text-muted">{formatTimeRemaining(req.deadline)}</p>
                          <DeadlineStatusBadge status={ds} />
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted">{formatDate(req.createdAt)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-text-primary">
                        {req.assignedOfficer?.name || <span className="text-text-muted">Unassigned</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/requests/${req.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-text-muted">
            Showing {requests.length} of {data?.total} requests
          </div>
        </div>
      )}
    </div>
  );
}
