import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { divisionApi, incidentApi } from '../../services/api';
import { Button } from './Button';
import { DivisionCode } from '../../types';
import toast from 'react-hot-toast';
import { Shuffle, X, AlertTriangle } from 'lucide-react';

interface ReclassifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  incidentNumber: string;
  currentCategoryName?: string;
  currentDivisionName?: string;
}

export function ReclassifyModal({
  isOpen,
  onClose,
  incidentId,
  incidentNumber,
  currentCategoryName,
  currentDivisionName,
}: ReclassifyModalProps) {
  const queryClient = useQueryClient();

  const [selectedDivision, setSelectedDivision] = useState<DivisionCode | ''>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [reasonNotes, setReasonNotes] = useState('');

  // Fetch divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => (await divisionApi.getDivisions()).data.data,
    enabled: isOpen,
  });

  const activeDivision = divisions.find((d) => d.code === selectedDivision);
  const categories = activeDivision?.categories || [];

  const reclassifyMutation = useMutation({
    mutationFn: async () => {
      return incidentApi.reclassify(incidentId, {
        categoryId: selectedCategoryId,
        notes: reasonNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Incident reclassified successfully');
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['all-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
      setSelectedCategoryId('');
      setReasonNotes('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reclassify incident');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200/90">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-brand-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Reclassify Incident</h3>
              <p className="text-xs text-slate-500 font-medium">Ticket: {incidentNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Classification Banner */}
        <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Current Classification</span>
          <span className="font-bold text-slate-900">{currentDivisionName || 'General'}</span>
          <span className="text-slate-400 mx-1">•</span>
          <span className="text-slate-700 font-medium">{currentCategoryName || 'Uncategorized'}</span>
        </div>

        {/* Target Division */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            1. Target IT Technical Division
          </label>
          <select
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value as DivisionCode);
              setSelectedCategoryId('');
            }}
            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            required
          >
            <option value="">-- Select Target Technical Division --</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* Target Category */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            2. Target Problem Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={!selectedDivision}
            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-50"
            required
          >
            <option value="">-- Select Target Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (SLA: {c.defaultSlaHours}h)
              </option>
            ))}
          </select>
        </div>

        {/* Reclassification Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Reclassification Rationale
          </label>
          <input
            type="text"
            placeholder="e.g. Branch misreported network failure; root problem is core teller software crash."
            value={reasonNotes}
            onChange={(e) => setReasonNotes(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={reclassifyMutation.isPending}
            onClick={() => {
              if (!selectedCategoryId) {
                toast.error('Please select a target problem category');
                return;
              }
              reclassifyMutation.mutate();
            }}
            className="bg-brand-900 hover:bg-brand-800 text-white font-semibold"
          >
            Confirm Reclassification
          </Button>
        </div>
      </div>
    </div>
  );
}
