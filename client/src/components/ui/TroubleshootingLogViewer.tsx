import React from 'react';
import { TroubleshootingLog } from '../../types';
import { formatTime, formatDateTime } from '../../utils';
import { Wrench, CheckCircle2, Search, ArrowRight } from 'lucide-react';

interface Props {
  logs: TroubleshootingLog[];
}

export function TroubleshootingLogViewer({ logs }: Props) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
        <Wrench className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium">No troubleshooting steps recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Technician will document diagnostic actions and findings here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-slate-900 tracking-tight uppercase tracking-wider">
            Diagnostic & Troubleshooting Audit Trail
          </h4>
        </div>
        <span className="font-mono text-[11px] text-slate-500 font-medium">
          {logs.length} record{logs.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {logs.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Step marker */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-mono font-medium shadow-subtle">
              {index + 1}
            </div>

            <div className="bg-white rounded-md border border-slate-200/90 p-3 shadow-subtle">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                    {formatTime(log.createdAt)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {log.technician?.name || 'Assigned Technician'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {/* Action */}
                <div className="bg-slate-50/80 rounded p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Action Taken
                  </span>
                  <p className="text-slate-800 font-medium">{log.action}</p>
                </div>

                {/* Observation */}
                <div className="bg-slate-50/80 rounded p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Search className="w-3 h-3 text-slate-400" /> Observation
                  </span>
                  <p className="text-slate-700">{log.observation}</p>
                </div>

                {/* Result */}
                <div className="bg-slate-50/80 rounded p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Finding / Result
                  </span>
                  <p className="text-slate-900 font-medium">{log.result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

