import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentApi, userApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { StatusBadge, PriorityBadge, SlaBadge, DivisionBadge } from "../../components/ui/Badge";
import { TroubleshootingLogViewer } from "../../components/ui/TroubleshootingLogViewer";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Input";
import { formatDateTime, timeAgo, formatTimeRemaining } from "../../utils";
import { Priority, TechnicianWithWorkload } from "../../types";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  HelpCircle,
  ShieldCheck,
  UserCheck,
  Edit3,
} from "lucide-react";

export function BranchIncidentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [isResolvedChoice, setIsResolvedChoice] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [replyText, setReplyText] = useState("");

  // Supervisor Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  // Supervisor Review Priority Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState<Priority>("MEDIUM");
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: incident, isLoading, error } = useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      const res = await incidentApi.getIncident(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const canManage = user?.role === "IT_SUPERVISOR" || user?.role === "ADMIN";

  // Technicians Query (for assignment)
  const { data: technicians } = useQuery<TechnicianWithWorkload[]>({
    queryKey: ["technicians", incident?.category?.division?.id],
    queryFn: async () => {
      const res = await userApi.getTechnicians(incident?.category?.division?.id);
      return res.data.data;
    },
    enabled: canManage && !!incident,
  });

  // Assign Technician mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      return incidentApi.assignTechnician(
        id!,
        selectedTechId,
        assignNotes.trim() || undefined
      );
    },
    onSuccess: () => {
      toast.success("Technician assigned successfully!");
      setAssignModalOpen(false);
      setSelectedTechId("");
      setAssignNotes("");
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["all-incidents"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Assignment failed");
    },
  });

  // Review Priority mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      return incidentApi.reviewIncident(id!, {
        priority: newPriority,
        notes: reviewNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Incident priority updated successfully!");
      setReviewModalOpen(false);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["all-incidents"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Review failed");
    },
  });

  // Verify resolution mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: { isResolved: boolean; feedback?: string }) => {
      return incidentApi.verifyResolution(id!, data);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isResolved
          ? "Resolution verified! Incident closed."
          : "Incident reopened for further troubleshooting."
      );
      setVerifyModalOpen(false);
      setFeedbackText("");
      setIsResolvedChoice(null);
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["my-incidents"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Verification failed");
    },
  });

  // Reply / Provide info mutation
  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      if (incident?.status === "WAITING_FOR_INFO") {
        return incidentApi.provideMoreInfo(id!, text);
      } else {
        return incidentApi.addNote(id!, { message: text });
      }
    },
    onSuccess: () => {
      toast.success("Information submitted successfully");
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit message");
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading incident details...</div>;
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-xl border border-red-200 text-red-600">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h3 className="text-base font-bold">Incident Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This incident does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/incidents")}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  const slaRemaining = formatTimeRemaining(incident.slaDeadline);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header with Back button and Supervisor actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/incidents")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </button>

        {/* Supervisor / Admin Quick Action Buttons */}
        {canManage && incident.status !== "CLOSED" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewPriority(incident.priority);
                setReviewModalOpen(true);
              }}
            >
              Review Priority
            </Button>

            <Button
              size="sm"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => setAssignModalOpen(true)}
              className="bg-brand-900 hover:bg-brand-800 text-white shadow-subtle font-semibold"
            >
              {incident.assignedTechnician ? "Reassign Technician" : "Assign Technician"}
            </Button>
          </div>
        )}
      </div>

      {/* Verification Banner (If RESOLVED) */}
      {incident.status === "RESOLVED" && (
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100/80 rounded border border-emerald-200 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-emerald-950">Technician Marked Issue as Resolved</h3>
              <p className="text-xs text-emerald-800 mt-0.5 max-w-xl">
                Please verify if the operational problem has been solved on your branch hardware or banking application.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsResolvedChoice(true);
              setVerifyModalOpen(true);
            }}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 shadow-subtle flex-shrink-0"
          >
            Verify Resolution
          </Button>
        </div>
      )}

      {/* Incident Header Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                {incident.incidentNumber}
              </span>
              <DivisionBadge
                code={incident.category?.division?.code}
                name={incident.category?.division?.name}
              />
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{incident.title}</h1>
          </div>
          <div className="text-right">
            <SlaBadge deadline={incident.slaDeadline} breached={incident.slaBreached} />
            <p className="text-[11px] text-slate-400 mt-1">
              Target SLA: <span className="font-medium text-slate-600">{slaRemaining.text}</span>
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Bank Branch</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {incident.branch?.name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Category</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {incident.category?.name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Reported By</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {incident.reportedBy?.name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Assigned Technician</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`font-semibold ${
                  incident.assignedTechnician ? "text-blue-700" : "text-amber-700 font-bold"
                }`}
              >
                {incident.assignedTechnician ? incident.assignedTechnician.name : "Awaiting Assignment"}
              </span>
              {canManage && incident.status !== "CLOSED" && (
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  [{incident.assignedTechnician ? "Change" : "Assign"}]
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Problem Description Box */}
        <div className="bg-slate-50/60 rounded-md p-3.5 border border-slate-200/70 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Problem Description
          </span>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
        </div>

        {/* Resolution Box (if recorded) */}
        {(incident.rootCause || incident.resolution) && (
          <div className="bg-emerald-50/40 rounded-md p-3.5 border border-emerald-200/80 text-xs space-y-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Recorded Resolution & Root Cause
            </span>
            {incident.rootCause && (
              <div>
                <span className="font-bold text-emerald-950">Root Cause: </span>
                <span className="text-emerald-900">{incident.rootCause}</span>
              </div>
            )}
            {incident.resolution && (
              <div>
                <span className="font-bold text-emerald-950">Resolution Summary: </span>
                <span className="text-emerald-900">{incident.resolution}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Troubleshooting Log Viewer */}
      <TroubleshootingLogViewer logs={incident.troubleshootingLogs || []} />

      {/* More Info Request Banner */}
      {incident.status === "WAITING_FOR_INFO" && (
        <div className="bg-amber-50/60 rounded-lg p-4 border border-amber-200/80 shadow-subtle space-y-3">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Technician Requested Additional Information
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The technician needs more details from your branch to continue diagnosis.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Provide answer or additional error details..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && replyText.trim()) {
                  replyMutation.mutate(replyText.trim());
                }
              }}
            />
            <Button
              onClick={() => replyText.trim() && replyMutation.mutate(replyText.trim())}
              loading={replyMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Send
            </Button>
          </div>
        </div>
      )}

      {/* Timeline & Conversation History */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Incident Timeline & Audit History</h3>

        <div className="space-y-3">
          {(incident.updates || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No timeline updates recorded yet.</p>
          ) : (
            (incident.updates || []).map((update) => (
              <div
                key={update.id}
                className="p-3 rounded-md border border-slate-200/70 bg-slate-50/40 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {update.user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      {update.user?.name || "System"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(update.createdAt)} ({timeAgo(update.createdAt)})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{update.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add note / message */}
        {incident.status !== "CLOSED" && incident.status !== "WAITING_FOR_INFO" && (
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Add a message or progress inquiry..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && replyText.trim()) {
                  replyMutation.mutate(replyText.trim());
                }
              }}
            />
            <Button
              onClick={() => replyText.trim() && replyMutation.mutate(replyText.trim())}
              loading={replyMutation.isPending}
              variant="secondary"
              className="text-xs font-semibold px-4"
            >
              Send
            </Button>
          </div>
        )}
      </div>

      {/* Assign Technician Modal (For Supervisor / Admin) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Technician: {incident.incidentNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Division: {incident.category?.division?.name} ({incident.category?.division?.code})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Technician
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
                    {t.name} ({t.division?.name || "General"}) — Active Load: {t.activeWorkload} ticket{t.activeWorkload === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please check the fiber media converter first."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedTechId) {
                    toast.error("Please select a technician");
                    return;
                  }
                  assignMutation.mutate();
                }}
                loading={assignMutation.isPending}
                className="bg-brand-900 hover:bg-brand-800 text-white font-semibold shadow-subtle"
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Priority Modal (For Supervisor / Admin) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Edit3 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Incident Priority: {incident.incidentNumber}
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
                <option value="CRITICAL">Critical (1 Hour SLA — Major service disruption)</option>
                <option value="HIGH">High (4 Hours SLA — Important service affected)</option>
                <option value="MEDIUM">Medium (1 Business Day — Limited impact)</option>
                <option value="LOW">Low (3 Business Days — Non-urgent request)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Review Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Upgraded due to VIP branch transaction impact"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => reviewMutation.mutate()}
                loading={reviewMutation.isPending}
                className="bg-brand-900 hover:bg-brand-800 text-white font-semibold shadow-subtle"
              >
                Save Priority
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Verification Modal (For Branch User) */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
            <div>
              <h3 className="text-base font-bold text-slate-900">Verify Resolution</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Please confirm whether this issue has been resolved at your branch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsResolvedChoice(true)}
                className={`p-3 rounded-md border text-center transition-all ${
                  isResolvedChoice === true
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-400/30"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                <span className="text-xs">Problem Solved</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResolvedChoice(false)}
                className={`p-3 rounded-md border text-center transition-all ${
                  isResolvedChoice === false
                    ? "border-rose-500 bg-rose-50 text-rose-800 font-bold ring-2 ring-rose-400/30"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <RotateCcw className="w-6 h-6 mx-auto text-rose-600 mb-1" />
                <span className="text-xs">Problem Still Exists</span>
              </button>
            </div>

            <Textarea
              label="Branch Verification Feedback"
              placeholder={
                isResolvedChoice === true
                  ? "e.g. Tested teller software and switch link, working smoothly."
                  : "Please explain what symptoms or errors are still occurring..."
              }
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setVerifyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (isResolvedChoice === null) {
                    toast.error("Please select whether the problem is solved or still exists");
                    return;
                  }
                  verifyMutation.mutate({
                    isResolved: isResolvedChoice,
                    feedback: feedbackText.trim() || undefined,
                  });
                }}
                loading={verifyMutation.isPending}
                className={
                  isResolvedChoice === true
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    : "bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                }
              >
                {isResolvedChoice === true ? "Confirm & Close Incident" : "Reopen Incident"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
