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
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
            <Wrench className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Technician Troubleshooting Log</h4>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {logs.length} step{logs.length === 1 ? '' : 's'} documented
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
        {logs.map((log, index) => (
          <div key={log.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-4 ring-white">
              {index + 1}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm hover:border-blue-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {formatTime(log.createdAt)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    by {log.technician?.name || 'Technician'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Action */}
                <div className="bg-slate-50 rounded p-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Action Taken
                  </span>
                  <p className="text-slate-800 font-medium">{log.action}</p>
                </div>

                {/* Observation */}
                <div className="bg-amber-50/50 rounded p-2.5 border border-amber-100/50">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Observation
                  </span>
                  <p className="text-slate-800">{log.observation}</p>
                </div>

                {/* Result */}
                <div className="bg-emerald-50/50 rounded p-2.5 border border-emerald-100/50">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Result / Finding
                  </span>
                  <p className="text-slate-800 font-medium">{log.result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

