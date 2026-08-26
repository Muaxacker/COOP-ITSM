import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, Target, Star, Timer } from 'lucide-react';
import { getManagerDashboard } from '../../services/dashboard.service';
import { StatCard } from '../../components/ui/Card';
import { RequestCard } from '../../components/ui/RequestCard';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';

export function ManagerDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: getManagerDashboard,
    refetchInterval: 60_000,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Unable to load dashboard" />;

  const d = data!;

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Branch Overview</h1>
          <p className="text-sm text-text-muted mt-0.5">Real-time service request monitoring</p>
        </div>
        <Link
          to="/attention"
          className="flex items-center gap-1.5 text-sm font-medium text-danger bg-danger-light px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          {d.overdueRequests.length + d.escalatedRequests.length} need attention
        </Link>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={d.stats.totalRequests} icon={<Target className="w-5 h-5" />} />
        <StatCard label="Open" value={d.stats.openRequests} icon={<Clock className="w-5 h-5" />} colorClass="text-warning" />
        <StatCard label="Resolved" value={d.stats.resolvedRequests} icon={<CheckCircle className="w-5 h-5" />} colorClass="text-success" />
        <StatCard
          label="Overdue"
          value={d.stats.overdueRequests}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorClass={d.stats.overdueRequests > 0 ? 'text-danger' : 'text-text-muted'}
        />
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resolution rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-teal" />
            <span className="text-sm font-semibold text-text-primary">Resolution Rate</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{d.stats.onTimeResolutionRate}%</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${d.stats.onTimeResolutionRate >= 90 ? 'bg-success' : d.stats.onTimeResolutionRate >= 70 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${d.stats.onTimeResolutionRate}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {d.stats.onTimeResolutionRate >= 90 ? '✅ Exceeding target (90%)' :
             d.stats.onTimeResolutionRate >= 70 ? '⚠️ Below target (90%)' :
             '🔴 Well below target (90%)'}
          </p>
        </div>

        {/* Avg resolution time */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-info" />
            <span className="text-sm font-semibold text-text-primary">Avg Resolution Time</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {d.stats.avgResolutionHours != null ? `${d.stats.avgResolutionHours}h` : '—'}
          </p>
          <p className="text-xs text-text-muted mt-2">Average hours from submission to resolution</p>
        </div>

        {/* Customer satisfaction */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-text-primary">Customer Satisfaction</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {d.stats.avgRating != null ? `${d.stats.avgRating}/5` : '—'}
          </p>
          <p className="text-xs text-text-muted mt-2">Average feedback rating</p>
        </div>
      </div>

      {/* Escalated requests */}
      {d.escalatedRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-danger flex items-center gap-2">
              🚨 Escalated Cases ({d.escalatedRequests.length})
            </h2>
            <Link to="/attention" className="text-xs text-teal hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.escalatedRequests.slice(0, 3).map((req) => (
              <RequestCard key={req.id} request={req} linkTo={`/requests/${req.id}`} showCustomer showOfficer />
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {d.overdueRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-danger flex items-center gap-2">
              ⚠️ Overdue Requests ({d.overdueRequests.length})
            </h2>
            <Link to="/attention" className="text-xs text-teal hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.overdueRequests.slice(0, 3).map((req) => (
              <RequestCard key={req.id} request={req} linkTo={`/requests/${req.id}`} showCustomer showOfficer />
            ))}
          </div>
        </div>
      )}

      {/* Deadline approaching */}
      {d.deadlineApproaching.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-warning flex items-center gap-2">
              🕐 Deadline Approaching ({d.deadlineApproaching.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.deadlineApproaching.map((req) => (
              <RequestCard key={req.id} request={req} linkTo={`/requests/${req.id}`} showCustomer showOfficer />
            ))}
          </div>
        </div>
      )}

      {d.overdueRequests.length === 0 && d.escalatedRequests.length === 0 && d.deadlineApproaching.length === 0 && (
        <EmptyState title="Everything is on track" description="No overdue, escalated, or deadline-approaching requests." />
      )}
    </div>
  );
}
