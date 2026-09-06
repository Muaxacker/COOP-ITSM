import React from 'react';
import { TroubleshootingLog } from '../../types';
import { formatTime, formatDateTime } from '../../utils';
import { Wrench, CheckCircle2, Search } from 'lucide-react';

interface Props {
  logs: TroubleshootingLog[];
}

export function TroubleshootingLogViewer({ logs }: Props) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-600">
        <Wrench className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">No troubleshooting steps recorded yet</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">Technician will document diagnostic actions and findings here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            <Wrench className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Diagnostic & Troubleshooting Audit Trail
          </h4>
        </div>
        <span className="font-mono text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {logs.length} step{logs.length === 1 ? '' : 's'} recorded
        </span>
      </div>

      <div className="relative pl-7 space-y-3.5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {logs.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Step marker */}
            <div className="absolute -left-7 top-1 w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shadow-subtle">
              {index + 1}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {formatTime(log.createdAt)}
                  </span>
                  <span className="text-xs text-slate-700 font-semibold">
                    {log.technician?.name || 'Assigned Technician'}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {/* Action */}
                <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Action Taken
                  </span>
                  <p className="text-slate-900 font-semibold">{log.action}</p>
                </div>

                {/* Observation */}
                <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-slate-500" /> Observation
                  </span>
                  <p className="text-slate-800 font-medium">{log.observation}</p>
                </div>

                {/* Result */}
                <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Finding / Result
                  </span>
                  <p className="text-slate-900 font-semibold">{log.result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
