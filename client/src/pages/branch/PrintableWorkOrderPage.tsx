import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../../services/api';
import { formatDateTime, formatTime } from '../../utils';
import { Printer, ArrowLeft, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

export function PrintableWorkOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => (await incidentApi.getIncident(id!)).data.data,
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-mono text-slate-500">Generating formal work order...</div>;
  }

  if (!incident) {
    return <div className="p-12 text-center text-rose-600">Incident record not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Print Control Toolbar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-md shadow-subtle"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Incident
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Official Work Order
        </button>
      </div>

      {/* Official Form Document */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-lg print:shadow-none print:border-none p-8 sm:p-10 space-y-6 text-xs">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
            <div className="text-left">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-600">Form Ref: COOP/IT/WO-{incident.incidentNumber}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-slate-500">Printed: {formatDateTime(new Date())}</span>
            </div>
          </div>

          <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
            COOPERATIVE BANK OF OROMIA (S.C.)
          </h1>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Directorate of Information Technology & Digital Banking Operations
          </h2>
          <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-black uppercase tracking-widest mt-1">
            IT Technical Service Request & Remediation Work Order
          </div>
        </div>

        {/* Section 1: Incident & Branch Identification */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 border border-slate-200">
            1. Service Ticket & Branch Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-200 p-3 rounded">
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Work Order #</span>
              <span className="font-mono font-black text-sm text-slate-900">{incident.incidentNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Originating Branch</span>
              <span className="font-bold text-slate-900">{incident.branch?.name} ({incident.branch?.code})</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Branch Location</span>
              <span className="font-medium text-slate-800">{incident.branch?.location}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Reported By</span>
              <span className="font-bold text-slate-900">{incident.reportedBy?.name}</span>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Technical Division</span>
              <span className="font-bold text-slate-900">{incident.category?.division?.name}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Problem Category</span>
              <span className="font-medium text-slate-800">{incident.category?.name}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Urgency / Priority</span>
              <span className="font-bold uppercase text-slate-900">{incident.priority}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Target SLA</span>
              <span className="font-medium text-slate-800">{formatDateTime(incident.slaDeadline)}</span>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Assigned Technician</span>
              <span className="font-bold text-slate-900">{incident.assignedTechnician?.name || 'Unassigned'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Current Status</span>
              <span className="font-bold uppercase text-slate-900">{incident.status}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Reported Date</span>
              <span className="font-medium text-slate-800">{formatDateTime(incident.createdAt)}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">SLA Compliance</span>
              <span className={`font-bold ${incident.slaBreached ? 'text-rose-700' : 'text-emerald-700'}`}>
                {incident.slaBreached ? 'DEADLINE BREACHED' : 'WITHIN SLA TARGET'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Problem Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 border border-slate-200">
            2. Problem Title & Symptoms Description
          </h3>
          <div className="border border-slate-200 p-3 rounded space-y-1.5">
            <p className="font-bold text-sm text-slate-900">{incident.title}</p>
            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
          </div>
        </div>

        {/* Section 3: Diagnostic Troubleshooting Steps */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 border border-slate-200">
            3. Technician Diagnostic & Troubleshooting Log
          </h3>
          {(!incident.troubleshootingLogs || incident.troubleshootingLogs.length === 0) ? (
            <div className="border border-dashed border-slate-300 p-3 text-center text-slate-500 italic">
              No intermediate troubleshooting steps logged.
            </div>
          ) : (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <th className="border border-slate-300 p-2 w-12 text-center">Step</th>
                  <th className="border border-slate-300 p-2 w-24">Time</th>
                  <th className="border border-slate-300 p-2">Action Taken</th>
                  <th className="border border-slate-300 p-2">Diagnostic Observation</th>
                  <th className="border border-slate-300 p-2">Result / Finding</th>
                </tr>
              </thead>
              <tbody>
                {incident.troubleshootingLogs.map((log: any, idx: number) => (
                  <tr key={log.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-mono font-bold text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{formatTime(log.createdAt)}</td>
                    <td className="border border-slate-300 p-2 font-medium">{log.action}</td>
                    <td className="border border-slate-300 p-2 text-slate-700">{log.observation}</td>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-900">{log.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 4: Confirmed Root Cause & Resolution */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 border border-slate-200">
            4. Confirmed Root Cause & Corrective Resolution
          </h3>
          <div className="border border-slate-200 p-3 rounded space-y-2">
            <div>
              <span className="font-bold text-slate-600 block text-[10px] uppercase">Confirmed Root Cause:</span>
              <p className="font-medium text-slate-900">{incident.rootCause || 'Pending diagnostic root-cause determination'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-600 block text-[10px] uppercase">Applied Corrective Remediation:</span>
              <p className="font-medium text-slate-900">{incident.resolution || 'Resolution work in-progress or awaiting verification'}</p>
            </div>
          </div>
        </div>

        {/* Section 5: Physical Sign-Off & Authorization Matrix */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 border border-slate-200">
            5. Formal Sign-off, Operational Verification & Acceptance
          </h3>

          <div className="grid grid-cols-3 gap-4 pt-3">
            {/* Requester */}
            <div className="border border-slate-300 p-3 rounded flex flex-col justify-between h-32">
              <div>
                <p className="font-bold text-slate-900 uppercase text-[10px]">Branch Staff / Requester</p>
                <p className="text-slate-600 mt-0.5">{incident.reportedBy?.name}</p>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500">
                <span>Signature & Branch Seal / Date</span>
              </div>
            </div>

            {/* Field Technician */}
            <div className="border border-slate-300 p-3 rounded flex flex-col justify-between h-32">
              <div>
                <p className="font-bold text-slate-900 uppercase text-[10px]">IT Field Technician</p>
                <p className="text-slate-600 mt-0.5">{incident.assignedTechnician?.name || '___________________'}</p>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500">
                <span>Signature & Employee ID / Date</span>
              </div>
            </div>

            {/* IT Supervisor / Auditor */}
            <div className="border border-slate-300 p-3 rounded flex flex-col justify-between h-32">
              <div>
                <p className="font-bold text-slate-900 uppercase text-[10px]">IT Operations Supervisor</p>
                <p className="text-slate-600 mt-0.5">Audit & Review Clearance</p>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500">
                <span>Verification Stamp / Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          This is an official document of the Cooperative Bank of Oromia (S.C.) ITSM Incident Remediation system.
          Unauthorized duplication or alteration is strictly prohibited under bank IT compliance regulations.
        </div>
      </div>
    </div>
  );
}
