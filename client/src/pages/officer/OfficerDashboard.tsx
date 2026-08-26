import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react';
import { getOfficerDashboard } from '../../services/dashboard.service';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/ui/Card';
import { RequestCard } from '../../components/ui/RequestCard';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';

export function OfficerDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'officer'],
    queryFn: getOfficerDashboard,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Unable to load dashboard" />;

  const firstName = user?.name.split(' ')[0] || '';

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, {firstName}</h1>
        <p className="text-sm text-text-muted mt-0.5">Here's your work queue for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Open Requests"
          value={data!.stats.openRequests}
          icon={<Inbox className="w-5 h-5" />}
        />
        <StatCard
          label="New Today"
          value={data!.stats.newRequests}
          icon={<Plus className="w-5 h-5" />}
          colorClass="text-info"
        />
        <StatCard
          label="Due Soon"
          value={data!.stats.dueSoon}
          icon={<Clock className="w-5 h-5" />}
          colorClass="text-warning"
        />
        <StatCard
          label="Overdue"
          value={data!.stats.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorClass={data!.stats.overdue > 0 ? 'text-danger' : 'text-text-muted'}
        />
        <StatCard
          label="Resolved Today"
          value={data!.stats.completedToday}
          icon={<CheckCircle className="w-5 h-5" />}
          colorClass="text-success"
        />
      </div>

      {/* Attention requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Requests Needing Attention
          </h2>
          <Link to="/requests" className="text-xs text-teal hover:underline">View queue</Link>
        </div>
        {data!.attentionRequests.length === 0 ? (
          <EmptyState title="All caught up!" description="No requests requiring immediate attention." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data!.attentionRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                linkTo={`/requests/${req.id}`}
                showCustomer
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
