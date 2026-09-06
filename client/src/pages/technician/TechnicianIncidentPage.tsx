import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from '../../components/ui/Badge';
import { TroubleshootingLogViewer } from '../../components/ui/TroubleshootingLogViewer';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { formatDateTime, timeAgo, formatTimeRemaining } from '../../utils';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Wrench,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  ShieldCheck,
  Plus,
  Phone,
  User as UserIcon,
} from 'lucide-react';

export function TechnicianIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Troubleshooting log form
  const [actionTaken, setActionTaken] = useState('');
  const [observation, setObservation] = useState('');
  const [resultFinding, setResultFinding] = useState('');
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Request info modal
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');

  // Resolve modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  const { data: incident, isLoading, error } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const res = await incidentApi.getIncident(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Start Investigation
  const startInvestMutation = useMutation({
    mutationFn: async () => incidentApi.startInvestigation(id!),
    onSuccess: () => {
      toast.success('Investigation started! Status changed to In Progress.');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to start investigation');
    },
  });

  // Request Info
  const requestInfoMutation = useMutation({
    mutationFn: async (question: string) => incidentApi.requestMoreInfo(id!, question),
    onSuccess: () => {
      toast.success('Information request sent to branch user');
      setInfoModalOpen(false);
      setQuestionText('');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to request info');
    },
  });

  // Add Troubleshooting Log
  async function handleAddTroubleshooting(e: React.FormEvent) {
    e.preventDefault();
    if (!actionTaken.trim() || !observation.trim() || !resultFinding.trim()) {
      toast.error('Please fill in Action, Observation, and Result');
      return;
    }

    setLogSubmitting(true);
    try {
      await incidentApi.addTroubleshootingLog(id!, {
        action: actionTaken.trim(),
        observation: observation.trim(),
        result: resultFinding.trim(),
      });
      toast.success('Troubleshooting step recorded!');
      setActionTaken('');
      setObservation('');
      setResultFinding('');
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record troubleshooting step');
    } finally {
      setLogSubmitting(false);
    }
  }

  // Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: async (data: { rootCause: string; resolution: string; notes?: string }) => {
      return incidentApi.resolveIncident(id!, data);
    },
    onSuccess: () => {
      toast.success('Incident marked as Resolved! Branch user notified to verify.');
      setResolveModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to resolve incident');
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading technician workbench...</div>;
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-xl border border-red-200 text-red-600">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h3 className="text-base font-bold">Incident Not Found</h3>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const slaRemaining = formatTimeRemaining(incident.slaDeadline);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {incident.status === 'ASSIGNED' && (
            <Button
              onClick={() => startInvestMutation.mutate()}
              loading={startInvestMutation.isPending}
              className="bg-brand-900 hover:bg-brand-800 text-white shadow-subtle font-semibold text-xs shadow-sm"
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              Start Investigation
            </Button>
          )}

          {['ASSIGNED', 'IN_PROGRESS'].includes(incident.status) && (
            <Button
              variant="secondary"
              onClick={() => setInfoModalOpen(true)}
              className="text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Request More Info
            </Button>
          )}

          {['IN_PROGRESS', 'WAITING_FOR_INFO'].includes(incident.status) && (
            <Button
              onClick={() => setResolveModalOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white shadow-subtle font-semibold text-xs shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Incident Details Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                {incident.incidentNumber}
              </span>
              <DivisionBadge
                code={incident.category.division?.code}
                name={incident.category.division?.name}
              />
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{incident.title}</h1>
          </div>
          <div className="text-right">
            <SlaBadge deadline={incident.slaDeadline} breached={incident.slaBreached} />
            <p className="text-[11px] text-slate-400 mt-1">
              Target: <span className="font-semibold text-slate-700">{slaRemaining.text}</span>
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Branch</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {incident.branch.name}
            </span>
            <span className="text-slate-400 text-[11px]">{incident.branch.location}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Category</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {incident.category.name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Reported By</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {incident.reportedBy.name}
            </span>
            {incident.reportedBy.phone && (
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3" /> {incident.reportedBy.phone}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Assigned Technician</span>
            <span className="font-semibold text-blue-700 block mt-0.5">
              {incident.assignedTechnician ? incident.assignedTechnician.name : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="bg-slate-50/60 rounded-md p-3.5 border border-slate-200/70 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Problem Description Reported by Branch
          </span>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
        </div>

        {/* Resolution details if available */}
        {(incident.rootCause || incident.resolution) && (
          <div className="bg-emerald-50/40 rounded-md p-3.5 border border-emerald-200/80 text-xs space-y-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Documented Resolution
            </span>
            {incident.rootCause && (
              <div>
                <span className="font-semibold text-emerald-950">Root Cause: </span>
                <span className="text-slate-800">{incident.rootCause}</span>
              </div>
            )}
            {incident.resolution && (
              <div>
                <span className="font-semibold text-emerald-950">Resolution: </span>
                <span className="text-slate-800">{incident.resolution}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Structured Troubleshooting Log Entry & History */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-6">
        {/* Step-by-Step Log Form */}
        {['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_INFO'].includes(incident.status) && (
          <form
            onSubmit={handleAddTroubleshooting}
            className="p-5 bg-slate-50/70 rounded-md border border-slate-200/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-900 text-white rounded">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Record Troubleshooting Step</h4>
                  <p className="text-[11px] text-slate-500">
                    Document each diagnostic action, observation, and result for institutional audit history
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Action Taken
                </label>
                <Input
                  placeholder="e.g. Checked switch port link & cable"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Diagnostic Observation
                </label>
                <Input
                  placeholder="e.g. Port 14 LED off, cable loose"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Result / Finding
                </label>
                <Input
                  placeholder="e.g. Broken RJ45 clip, re-crimped connector"
                  value={resultFinding}
                  onChange={(e) => setResultFinding(e.target.value)}
                  className="text-xs bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={logSubmitting}
                className="bg-brand-900 hover:bg-brand-800 text-white shadow-subtle font-semibold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Troubleshooting Step
              </Button>
            </div>
          </form>
        )}

        {/* Existing Logs List */}
        <TroubleshootingLogViewer logs={incident.troubleshootingLogs || []} />
      </div>

      {/* Timeline & Notes */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Complete Incident Audit History</h3>
        <div className="space-y-2.5">
          {incident.updates?.map((u) => (
            <div key={u.id} className="p-3 bg-slate-50/50 rounded-md border border-slate-200/70 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-800">{u.user?.name || 'System'}</span>
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(u.createdAt)} ({timeAgo(u.createdAt)})
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{u.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Request Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
            <h3 className="text-base font-bold text-slate-900">Request Information from Branch</h3>
            <p className="text-xs text-slate-500">
              The status will transition to <span className="font-bold text-orange-600">Waiting for Info</span> and the branch user will be notified.
            </p>
            <Textarea
              label="Question for Branch User"
              placeholder="e.g. Which teller workstation number is experiencing the error? Has the PC been restarted?"
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="text-xs"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setInfoModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!questionText.trim()) return;
                  requestInfoMutation.mutate(questionText.trim());
                }}
                loading={requestInfoMutation.isPending}
                className="bg-brand-900 hover:bg-brand-800 text-white font-semibold shadow-subtle"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Mark Incident as Resolved</h3>
                <p className="text-xs text-slate-500">Document the confirmed root cause and corrective resolution</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Root Cause Identification *
                </label>
                <Textarea
                  placeholder="e.g. Broken RJ45 plastic clip caused loose contact at teller wall outlet."
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Corrective Resolution Performed *
                </label>
                <Textarea
                  placeholder="e.g. Re-crimped cable with new shielded RJ45 connector, verified 1 Gbps link, and tested teller software ping."
                  rows={3}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Additional Notes (Optional)
                </label>
                <Input
                  placeholder="e.g. Advised branch operations to avoid pulling ethernet cords."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!rootCause.trim() || !resolutionSummary.trim()) {
                    toast.error('Both root cause and resolution summary are required.');
                    return;
                  }
                  resolveMutation.mutate({
                    rootCause: rootCause.trim(),
                    resolution: resolutionSummary.trim(),
                    notes: resolveNotes.trim() || undefined,
                  });
                }}
                loading={resolveMutation.isPending}
                className="bg-emerald-800 hover:bg-emerald-900 text-white shadow-subtle font-semibold"
              >
                Submit Resolution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

