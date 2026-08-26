import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import { getManagerDashboard } from '../../services/dashboard.service';
import { assignRequest } from '../../services/request.service';
import { getOfficers } from '../../services/admin.service';
import { RequestCard } from '../../components/ui/RequestCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const TABS = ['All', 'Overdue', 'Escalated', 'Approaching'];

export function AttentionPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [reassignRequestId, setReassignRequestId] = useState<string | null>(null);
  const [officerId, setOfficerId] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: getManagerDashboard,
    refetchInterval: 60_000,
  });

  const { data: officers } = useQuery({
    queryKey: ['officers'],
    queryFn: getOfficers,
    enabled: !!reassignRequestId,
  });

  const reassignMutation = useMutation({
    mutationFn: () => assignRequest(reassignRequestId!, officerId),
    onSuccess: () => {
      toast.success('Request reassigned');
      setReassignRequestId(null);
      setOfficerId('');
      qc.invalidateQueries({ queryKey: ['dashboard', 'manager'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Unable to load attention list" />;

  const d = data!;
  const allAttention = [
    ...d.overdueRequests.map(r => ({ ...r, _tag: 'overdue' })),
    ...d.escalatedRequests.map(r => ({ ...r, _tag: 'escalated' })),
    ...d.deadlineApproaching.map(r => ({ ...r, _tag: 'approaching' })),
  ];

  const filtered = activeTab === 'All' ? allAttention
    : activeTab === 'Overdue' ? d.overdueRequests.map(r => ({ ...r, _tag: 'overdue' }))
    : activeTab === 'Escalated' ? d.escalatedRequests.map(r => ({ ...r, _tag: 'escalated' }))
    : d.deadlineApproaching.map(r => ({ ...r, _tag: 'approaching' }));

  const counts = {
    All: allAttention.length,
    Overdue: d.overdueRequests.length,
    Escalated: d.escalatedRequests.length,
    Approaching: d.deadlineApproaching.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Needs Attention</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {allAttention.length} cases require immediate management action
        </p>
      </div>

      {/* Summary banners */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-danger-light border border-danger/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-danger">{d.overdueRequests.length}</p>
            <p className="text-xs text-danger/70 font-medium">Overdue</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-red-600">{d.escalatedRequests.length}</p>
            <p className="text-xs text-red-500/70 font-medium">Escalated</p>
          </div>
        </div>
        <div className="bg-warning-light border border-warning/20 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-warning">{d.deadlineApproaching.length}</p>
            <p className="text-xs text-warning/70 font-medium">Due Soon</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab ? 'border-teal text-teal' : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            {tab}
            {counts[tab as keyof typeof counts] > 0 && (
              <span className="ml-1.5 text-xs bg-danger text-white rounded-full px-1.5 py-0.5">
                {counts[tab as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={`No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}cases`} description="All clear for this category." />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className={cn(
              'bg-white rounded-xl border p-4',
              req._tag === 'overdue' ? 'border-l-4 border-l-danger border-r-gray-200 border-t-gray-200 border-b-gray-200' :
              req._tag === 'escalated' ? 'border-l-4 border-l-red-500 border-r-gray-200 border-t-gray-200 border-b-gray-200' :
              'border-l-4 border-l-warning border-r-gray-200 border-t-gray-200 border-b-gray-200'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <RequestCard request={req} linkTo={`/requests/${req.id}`} showCustomer showOfficer />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReassignRequestId(req.id)}
                >
                  Reassign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reassign modal */}
      <Modal
        isOpen={!!reassignRequestId}
        onClose={() => setReassignRequestId(null)}
        title="Reassign Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setReassignRequestId(null)}>Cancel</Button>
            <Button onClick={() => reassignMutation.mutate()} loading={reassignMutation.isPending} disabled={!officerId}>
              Reassign
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">Select a different officer to handle this request.</p>
        {officers && (
          <Select
            label="New Officer"
            placeholder="Select officer..."
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            options={officers.map((o) => ({ value: o.id, label: `${o.name} — ${o.department?.name || 'No dept'}` }))}
          />
        )}
      </Modal>
    </div>
  );
}
