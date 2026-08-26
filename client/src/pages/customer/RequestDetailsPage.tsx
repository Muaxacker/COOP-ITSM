import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star } from 'lucide-react';
import { getRequestById, reopenRequest, closeRequest, submitFeedback } from '../../services/request.service';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { DeadlineCard } from '../../components/ui/DeadlineCard';
import { Timeline, StatusStepper } from '../../components/ui/Timeline';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatDate, formatDateTime } from '../../utils';
import toast from 'react-hot-toast';

export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequestById(id!),
    enabled: !!id,
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenRequest(id!, reopenReason),
    onSuccess: () => {
      toast.success('Request reopened');
      setShowReopenModal(false);
      qc.invalidateQueries({ queryKey: ['request', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to reopen'),
  });

  const closeMutation = useMutation({
    mutationFn: () => closeRequest(id!),
    onSuccess: () => {
      toast.success('Request closed. Thank you for your confirmation!');
      setShowFeedbackModal(true);
      qc.invalidateQueries({ queryKey: ['request', id] });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: () => submitFeedback(id!, rating, comment || undefined),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      setShowFeedbackModal(false);
      qc.invalidateQueries({ queryKey: ['request', id] });
      navigate('/requests');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit feedback'),
  });

  if (isLoading) return <LoadingState />;
  if (error || !request) return <ErrorState message="Unable to load request details" />;

  const isCustomerOwner = user?.role === 'CUSTOMER' && request.customer.id === user.id;
  const canConfirmOrReopen = isCustomerOwner && request.status === 'RESOLVED';
  const canSubmitFeedback = isCustomerOwner && request.status === 'CLOSED' && !request.feedback;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link to="/requests" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
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
            {request.category.name} · Submitted {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      {/* Status stepper */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-5">Request Progress</h3>
        <StatusStepper currentStatus={request.status} />
        {['OVERDUE', 'ESCALATED', 'REOPENED'].includes(request.status) && (
          <div className="mt-4 px-4 py-3 bg-danger-light border border-danger/20 rounded-lg">
            <p className="text-sm font-medium text-danger">
              {request.status === 'OVERDUE' && '⚠️ This request has exceeded its service deadline.'}
              {request.status === 'ESCALATED' && '🚨 This request has been escalated to management.'}
              {request.status === 'REOPENED' && '🔄 This request has been reopened for further investigation.'}
            </p>
          </div>
        )}
      </Card>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeadlineCard request={request} />
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Request Info</h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Category</dt>
              <dd className="font-medium text-text-primary">{request.category.name}</dd>
            </div>
            {request.category.department && (
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">Department</dt>
                <dd className="font-medium text-text-primary">{request.category.department.name}</dd>
              </div>
            )}
            {request.assignedOfficer && (
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">Assigned to</dt>
                <dd className="font-medium text-text-primary">{request.assignedOfficer.name}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Submitted</dt>
              <dd className="font-medium text-text-primary">{formatDateTime(request.createdAt)}</dd>
            </div>
            {request.resolvedAt && (
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">Resolved</dt>
                <dd className="font-medium text-success">{formatDateTime(request.resolvedAt)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Description</h3>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{request.description}</p>
      </Card>

      {/* Confirm resolution */}
      {canConfirmOrReopen && (
        <Card className="border-success/30 bg-success-light/30">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Has your issue been resolved?</h3>
          <p className="text-sm text-text-secondary mb-4">
            An officer has marked this request as resolved. Please confirm if your problem has been solved.
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => closeMutation.mutate()}
              loading={closeMutation.isPending}
            >
              ✓ Yes, it's resolved
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReopenModal(true)}
              className="border-danger/40 text-danger hover:bg-danger-light"
            >
              ✗ No, reopen request
            </Button>
          </div>
        </Card>
      )}

      {/* Feedback prompt for closed requests */}
      {canSubmitFeedback && (
        <Card className="border-teal/30 bg-teal/5">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Rate your experience</h3>
          <p className="text-sm text-text-secondary mb-3">Help us improve by sharing your feedback.</p>
          <Button variant="outline" onClick={() => setShowFeedbackModal(true)}>
            Leave Feedback
          </Button>
        </Card>
      )}

      {/* Existing feedback */}
      {request.feedback && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Your Feedback</h3>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= request.feedback!.rating ? 'text-warning fill-warning' : 'text-gray-200'}`} />
            ))}
            <span className="ml-2 text-sm font-medium text-text-primary">{request.feedback.rating}/5</span>
          </div>
          {request.feedback.comment && (
            <p className="text-sm text-text-secondary italic">"{request.feedback.comment}"</p>
          )}
        </Card>
      )}

      {/* Activity timeline */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Activity History</h3>
        <Timeline activities={request.activities || []} />
      </Card>

      {/* Reopen modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowReopenModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => reopenMutation.mutate()}
              loading={reopenMutation.isPending}
              disabled={reopenReason.length < 5}
            >
              Reopen
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">
          Please explain why the issue was not resolved. This will help the officer investigate further.
        </p>
        <Textarea
          label="Reason for reopening"
          placeholder="Describe what is still not working..."
          value={reopenReason}
          onChange={(e) => setReopenReason(e.target.value)}
          rows={4}
        />
      </Modal>

      {/* Feedback modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Rate Your Experience"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>Skip</Button>
            <Button
              onClick={() => feedbackMutation.mutate()}
              loading={feedbackMutation.isPending}
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">How satisfied were you with the resolution of your request?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${s <= rating ? 'text-warning fill-warning' : 'text-gray-200 hover:text-warning/60'} transition-colors`} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-text-muted">
              {rating === 5 ? '⭐ Excellent!' : rating === 4 ? '👍 Good' : rating === 3 ? '🤔 Average' : rating === 2 ? '😕 Poor' : '😞 Very poor'}
            </p>
          )}
          <Textarea
            label="Comment (optional)"
            placeholder="Share any additional feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
