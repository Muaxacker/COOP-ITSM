import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Filter } from 'lucide-react';
import { getRequests } from '../../services/request.service';
import { RequestStatus } from '../../types';
import { RequestCard } from '../../components/ui/RequestCard';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';

const TABS: Array<{ label: string; status?: RequestStatus | 'ACTIVE' }> = [
  { label: 'All' },
  { label: 'Active', status: 'ACTIVE' },
  { label: 'Resolved', status: 'RESOLVED' },
  { label: 'Closed', status: 'CLOSED' },
];

export function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Map tab to status filter
  function getStatusParam() {
    const tab = TABS.find(t => t.label === activeTab);
    if (!tab?.status || tab.status === 'ACTIVE') return undefined;
    return tab.status as RequestStatus;
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests', 'customer', activeTab, debouncedSearch],
    queryFn: () => getRequests({
      status: getStatusParam(),
      search: debouncedSearch || undefined,
      limit: 50,
    }),
  });

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(value), 400);
  }

  let requests = data?.requests || [];

  // Client-side filter for "Active" tab
  if (activeTab === 'Active') {
    requests = requests.filter(r => !['RESOLVED', 'CLOSED'].includes(r.status));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Requests</h1>
          <p className="text-sm text-text-muted mt-0.5">{data?.total ?? 0} total requests</p>
        </div>
        <Link to="/requests/new">
          <Button icon={<Plus className="w-4 h-4" />}>New Request</Button>
        </Link>
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
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
        <EmptyState
          title="No requests found"
          description="You haven't submitted any requests yet."
          action={
            <Link to="/requests/new">
              <Button icon={<Plus className="w-4 h-4" />}>Create Request</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} linkTo={`/requests/${req.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
