import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, Smartphone, ArrowRightLeft, Building2,
  MessageSquareWarning, Landmark, Plus, ArrowRight
} from 'lucide-react';
import { getCustomerDashboard } from '../../services/dashboard.service';
import { useAuth } from '../../hooks/useAuth';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { DeadlineStatusBadge } from '../../components/ui/Badge';
import { formatDate, getDeadlineStatus } from '../../utils';

const SERVICE_TILES = [
  { icon: Landmark, label: 'ATM Services', color: 'bg-blue-50 text-blue-600', category: 'ATM' },
  { icon: CreditCard, label: 'Card Services', color: 'bg-purple-50 text-purple-600', category: 'CARD' },
  { icon: Smartphone, label: 'Mobile Banking', color: 'bg-teal/10 text-teal', category: 'MOBILE' },
  { icon: ArrowRightLeft, label: 'Transfer Issues', color: 'bg-orange-50 text-orange-600', category: 'TRANSFER' },
  { icon: Building2, label: 'Account Services', color: 'bg-green-50 text-green-600', category: 'ACCOUNT' },
  { icon: MessageSquareWarning, label: 'Raise Complaint', color: 'bg-red-50 text-red-600', category: 'COMPLAINT' },
];

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'customer'],
    queryFn: getCustomerDashboard,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Unable to load dashboard" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] || 'there';

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-text-muted mt-1">How can we help you today?</p>
        </div>
        <Link
          to="/requests/new"
          className="flex items-center gap-2 bg-teal text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={data!.stats.totalRequests} />
        <StatCard label="Active" value={data!.stats.activeRequests} colorClass="text-warning" />
        <StatCard label="Resolved" value={data!.stats.resolvedRequests} colorClass="text-success" />
      </div>

      {/* Service tiles */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICE_TILES.map((tile) => (
            <button
              key={tile.category}
              onClick={() => navigate('/requests/new')}
              className="flex flex-col items-start gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-teal/40 hover:shadow-card transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tile.color}`}>
                <tile.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-text-primary">{tile.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent Requests</h2>
          <Link to="/requests" className="text-xs text-teal hover:underline">View all</Link>
        </div>
        {data!.recentRequests.length === 0 ? (
          <Card>
            <p className="text-sm text-text-muted text-center py-6">No requests yet. Create your first request above.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {data!.recentRequests.map((req) => {
              const ds = getDeadlineStatus(req.deadline, req.createdAt);
              return (
                <Link key={req.id} to={`/requests/${req.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-muted">{req.requestNumber}</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">{req.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{req.category.name} · {formatDate(req.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={req.status} />
                        {!['RESOLVED', 'CLOSED'].includes(req.status) && (
                          <DeadlineStatusBadge status={ds} />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
