import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../services/api';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils';
import { Shield, Search, Filter, History, User, Clock, ArrowRight } from 'lucide-react';

export function AuditLogPage() {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { action, entityType, startDate, endDate, page }],
    queryFn: async () => {
      const res = await auditApi.getAuditLogs({
        action: action || undefined,
        entityType: entityType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
      });
      return res.data.data;
    },
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const getActionBadgeColor = (act: string) => {
    if (act.includes('CREATED') || act.includes('UPLOADED')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (act.includes('ASSIGNED') || act.includes('RECLASSIFIED')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (act.includes('RESOLVED') || act.includes('CLOSED')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (act.includes('DELETED') || act.includes('BREACHED') || act.includes('REOPENED')) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const renderDiff = (oldVal?: string | null, newVal?: string | null) => {
    if (!oldVal && !newVal) return <span className="text-slate-400 italic">No diff recorded</span>;

    try {
      const parsedOld = oldVal ? JSON.parse(oldVal) : null;
      const parsedNew = newVal ? JSON.parse(newVal) : null;

      return (
        <div className="space-y-1 font-mono text-xs">
          {parsedOld && (
            <div className="text-rose-700 bg-rose-50/60 p-1.5 rounded border border-rose-100">
              <span className="font-bold">Before: </span>
              {JSON.stringify(parsedOld)}
            </div>
          )}
          {parsedNew && (
            <div className="text-emerald-800 bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
              <span className="font-bold">After: </span>
              {JSON.stringify(parsedNew)}
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="space-y-0.5 text-xs">
          {oldVal && <p className="text-rose-700">- {oldVal}</p>}
          {newVal && <p className="text-emerald-800">+ {newVal}</p>}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
              Compliance & Governance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">Immutable Audit Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            System Regulatory Audit Trail
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Tamper-evident chronological record of all incident mutations, triage reclassifications, and administrative events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <History className="w-4 h-4 text-slate-500" />
          <span>{pagination.total} total logged events</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Action Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Type
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Actions</option>
              <option value="INCIDENT_CREATED">Incident Created</option>
              <option value="INCIDENT_ASSIGNED">Technician Assigned</option>
              <option value="INCIDENT_RECLASSIFIED">Incident Reclassified</option>
              <option value="INVESTIGATION_STARTED">Investigation Started</option>
              <option value="TROUBLESHOOTING_ADDED">Troubleshooting Added</option>
              <option value="INCIDENT_RESOLVED">Incident Resolved</option>
              <option value="INCIDENT_VERIFIED_CLOSED">Resolution Verified</option>
              <option value="ATTACHMENT_UPLOADED">Attachment Uploaded</option>
              <option value="ATTACHMENT_DELETED">Attachment Removed</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Entity
            </label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Entities</option>
              <option value="Incident">Incidents</option>
              <option value="Attachment">Attachments</option>
              <option value="User">Users</option>
              <option value="Branch">Branches</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">Loading compliance logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No audit records found matching the specified parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-40">Timestamp</th>
                  <th className="px-4 py-3 w-48">Operator / Actor</th>
                  <th className="px-4 py-3 w-44">Action</th>
                  <th className="px-4 py-3 w-36">Entity</th>
                  <th className="px-4 py-3">Modification Details / Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors align-top">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-slate-900">{log.user.name}</p>
                          <p className="text-slate-500 font-mono">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-mono">System / Automation</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-700">
                      <span className="block text-slate-900 font-bold">{log.entityType}</span>
                      <span className="text-[11px] text-slate-400 truncate block max-w-[120px]">{log.entityId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {renderDiff(log.oldValue, log.newValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} audit entries)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
