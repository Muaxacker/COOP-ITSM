import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import {
  getRequestById,
  reviewRequest, assignRequest, startInvestigation,
  addNote, escalateRequest, resolveRequest
} from '../../services/request.service';
import { getOfficers } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { DeadlineCard } from '../../components/ui/DeadlineCard';
import { Timeline, StatusStepper } from '../../components/ui/Timeline';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime } from '../../utils';
import toast from 'react-hot-toast';
import { RequestStatus } from '../../types';

export function CaseManagementPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [note, setNote] = useState('');
  const [noteVisible, setNoteVisible] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [resolution, setResolution] = useState('');
  const [assignOfficerId, setAssignOfficerId] = useState('');

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequestById(id!),
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const { data: officers } = useQuery({
    queryKey: ['officers'],
    queryFn: getOfficers,
    enabled: showAssignModal,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['request', id] });
    qc.invalidateQueries({ queryKey: ['requests'] });
    qc.invalidateQueries({ queryKey: ['dashboard', 'officer'] });
  }

  const reviewMutation = useMutation({
    mutationFn: () => reviewRequest(id!),
    onSuccess: () => { toast.success('Request reviewed'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const startMutation = useMutation({
    mutationFn: () => startInvestigation(id!),
    onSuccess: () => { toast.success('Investigation started'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const assignMutation = useMutation({
    mutationFn: () => assignRequest(id!, assignOfficerId),
    onSuccess: () => { toast.success('Request assigned'); setShowAssignModal(false); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const noteMutation = useMutation({
    mutationFn: () => addNote(id!, note, noteVisible),
    onSuccess: () => { toast.success('Note added'); setShowNoteModal(false); setNote(''); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const escalateMutation = useMutation({
    mutationFn: () => escalateRequest(id!, escalateReason),
    onSuccess: () => { toast.success('Request escalated to manager'); setShowEscalateModal(false); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveRequest(id!, resolution),
    onSuccess: () => { toast.success('Request resolved'); setShowResolveModal(false); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  if (isLoading) return <LoadingState />;
  if (error || !request) return <ErrorState message="Unable to load case" />;

  const status = request.status as RequestStatus;
  const isAssignedToMe = request.assignedOfficer?.id === user?.id;
  const canAct = user?.role === 'OFFICER' || user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Primary action button based on current status
  function PrimaryAction() {
    if (!canAct) return null;

    // NEW or REOPENED → Review first (takes ownership)
    if (status === 'NEW' || status === 'REOPENED') {
      return (
        <Button onClick={() => reviewMutation.mutate()} loading={reviewMutation.isPending}>
          Review Request
        </Button>
      );
    }
    // REVIEWED or ASSIGNED → Start Investigation
    if (status === 'REVIEWED' || status === 'ASSIGNED') {
      return (
        <Button onClick={() => startMutation.mutate()} loading={startMutation.isPending}>
          Start Investigation
        </Button>
      );
    }
    // INVESTIGATING, ESCALATED, OVERDUE → Resolve
    if (status === 'INVESTIGATING' || status === 'ESCALATED' || status === 'OVERDUE') {
      return (
        <Button onClick={() => setShowResolveModal(true)}>
          Resolve Request
        </Button>
      );
    }
    // RESOLVED → waiting for customer confirmation
    if (status === 'RESOLVED') {
      return (
        <span className="text-sm text-success font-medium bg-success-light px-3 py-2 rounded-lg">
          ✓ Resolved — awaiting customer confirmation
        </span>
      );
    }
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/requests" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-text-muted">{request.requestNumber}</span>
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
          <h1 className="text-xl font-bold text-text-primary">{request.title}</h1>
          <p className="text-sm text-text-muted mt-1">
            {request.category.name}
            {request.category.department && ` · ${request.category.department.name}`}
            {' · '} Submitted {formatDateTime(request.createdAt)}
          </p>
        </div>
        {/* Action bar */}
        {canAct && (
          <div className="flex flex-wrap gap-2">
            <PrimaryAction />
            {!['RESOLVED', 'CLOSED'].includes(status) && (
              <>
                <Button variant="outline" onClick={() => setShowAssignModal(true)}>Assign</Button>
                <Button variant="outline" onClick={() => setShowNoteModal(true)}>Add Note</Button>
                {(status === 'INVESTIGATING' || status === 'OVERDUE') && (
                  <Button
                    variant="outline"
                    className="border-danger/40 text-danger hover:bg-danger-light"
                    onClick={() => setShowEscalateModal(true)}
                  >
                    Escalate
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Status stepper */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-5">Request Progress</h3>
        <StatusStepper currentStatus={status} />
      </Card>

      {/* Top info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeadlineCard request={request} />
        {/* Customer card */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-text-muted" /> Customer
          </h3>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">{request.customer.name}</p>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Mail className="w-3.5 h-3.5 text-text-muted" />
              <span>{request.customer.email}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-text-muted mb-1">Assigned Officer</p>
            <p className="text-sm font-medium text-text-primary">
              {request.assignedOfficer ? (
                <span className={isAssignedToMe ? 'text-teal' : ''}>
                  {request.assignedOfficer.name} {isAssignedToMe && '(you)'}
                </span>
              ) : (
                <span className="text-text-muted">Unassigned</span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Customer Description</h3>
            <p className="text-sm text-text-secondary whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
              {request.description}
            </p>
          </Card>
        </div>

        {/* Right: Activity */}
        <div>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Activity History</h3>
            <Timeline activities={request.activities || []} />
          </Card>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}

      {/* Add Note */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowNoteModal(false)}>Cancel</Button>
            <Button onClick={() => noteMutation.mutate()} loading={noteMutation.isPending} disabled={note.length < 2}>
              Add Note
            </Button>
          </>
        }
      >
        <Textarea
          label="Note"
          placeholder="Add an internal note or customer-visible update..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />
        <label className="flex items-center gap-2 mt-3 text-sm text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={noteVisible}
            onChange={(e) => setNoteVisible(e.target.checked)}
            className="rounded"
          />
          Visible to customer
        </label>
      </Modal>

      {/* Assign */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={() => assignMutation.mutate()} loading={assignMutation.isPending} disabled={!assignOfficerId}>
              Assign
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">Select an officer to assign this request to.</p>
        {officers && (
          <Select
            label="Officer"
            placeholder="Select officer..."
            value={assignOfficerId}
            onChange={(e) => setAssignOfficerId(e.target.value)}
            options={officers.map((o) => ({ value: o.id, label: `${o.name} (${o.department?.name || 'No dept'})` }))}
          />
        )}
      </Modal>

      {/* Escalate */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="Escalate Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => escalateMutation.mutate()}
              loading={escalateMutation.isPending}
              disabled={escalateReason.length < 5}
            >
              Escalate to Manager
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">
          This will notify the branch manager and mark the request as escalated.
        </p>
        <Textarea
          label="Reason for escalation"
          placeholder="Describe why this case needs manager attention..."
          value={escalateReason}
          onChange={(e) => setEscalateReason(e.target.value)}
          rows={4}
        />
      </Modal>

      {/* Resolve */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>Cancel</Button>
            <Button
              onClick={() => resolveMutation.mutate()}
              loading={resolveMutation.isPending}
              disabled={resolution.length < 5}
            >
              Mark as Resolved
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">
          Describe the resolution. The customer will be notified and asked to confirm.
        </p>
        <Textarea
          label="Resolution details"
          placeholder="Describe what was done to resolve this issue..."
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}
