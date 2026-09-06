import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { branchApi, divisionApi, incidentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DivisionCode } from '../../types';
import toast from 'react-hot-toast';
import {
  PlusCircle,
  ArrowLeft,
  Building2,
  AlertCircle,
  Landmark,
  MonitorCheck,
  Network,
  Wrench,
  HelpCircle,
} from 'lucide-react';

export function CreateIncidentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [branchId, setBranchId] = useState(user?.branchId || '');
  const [selectedDivision, setSelectedDivision] = useState<DivisionCode>('NETWORKING');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch branches
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await branchApi.getBranches();
      return res.data.data;
    },
  });

  // Fetch divisions
  const { data: divisionsData } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const res = await divisionApi.getDivisions();
      return res.data.data;
    },
  });

  const branches = branchesData || [];
  const divisions = divisionsData || [];

  // Active division & its categories
  const activeDivision = divisions.find((d) => d.code === selectedDivision);
  const categories = activeDivision?.categories || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!branchId) {
      toast.error('Please select a branch');
      return;
    }
    if (!categoryId) {
      toast.error('Please select an incident category');
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      toast.error('Please enter a descriptive title');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please provide a detailed description (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const res = await incidentApi.createIncident({
        branchId,
        categoryId,
        title: title.trim(),
        description: description.trim(),
      });
      toast.success(`Incident ${res.data.data.incidentNumber} submitted successfully!`);
      navigate(`/incidents/${res.data.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit incident';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const divisionMeta: Record<
    DivisionCode,
    { title: string; subtitle: string; icon: React.ReactNode }
  > = {
    ATM: {
      title: 'ATM Operations',
      subtitle: 'ATM hardware, card reader, cash dispenser & receipt printers',
      icon: <Landmark className="w-4 h-4" />,
    },
    APPLICATION: {
      title: 'Core Applications',
      subtitle: 'Core banking software, branch teller tools & user access',
      icon: <MonitorCheck className="w-4 h-4" />,
    },
    NETWORKING: {
      title: 'Network Infrastructure',
      subtitle: 'WAN router, LAN switch, fiber lines, cabling & branch WiFi',
      icon: <Network className="w-4 h-4" />,
    },
    MAINTENANCE: {
      title: 'Systems & Hardware',
      subtitle: 'Workstation PCs, laser printers, scanners, UPS & power units',
      icon: <Wrench className="w-4 h-4" />,
    },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report Technical Incident</h1>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Dispatch an operational service ticket to regional Tier-2 IT support engineering.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200/80 shadow-subtle p-5 space-y-5">
        {/* Branch Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Originating Bank Branch
          </label>
          <div className="relative">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              required
            >
              <option value="">-- Select Originating Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code}) — {b.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Division Selection (The 4 core IT areas) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Responsible IT Technical Division
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(['NETWORKING', 'APPLICATION', 'ATM', 'MAINTENANCE'] as DivisionCode[]).map((code) => {
              const meta = divisionMeta[code];
              const isSelected = selectedDivision === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setSelectedDivision(code);
                    setCategoryId(''); // reset category on division switch
                  }}
                  className={`p-3.5 rounded-md border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900 shadow-subtle'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                  }`}
                >
                  <div
                    className={`p-2 rounded border mt-0.5 ${
                      isSelected
                        ? 'bg-brand-900 text-white border-brand-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                      {meta.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            3. Specific Issue Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            required
          >
            <option value="">-- Select Problem Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Default SLA: {c.defaultSlaHours}h, {c.defaultPriority})
              </option>
            ))}
          </select>
          {categoryId && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
              {categories.find((c) => c.id === categoryId)?.description}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            4. Incident Title / Summary
          </label>
          <Input
            placeholder="e.g. Workstation 3 cannot reach core transaction database"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs h-10"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            5. Technical Description & Observations
          </label>
          <Textarea
            placeholder="Document observable symptoms, relevant error codes, affected teller counters or ATM IDs, and preliminary restart attempts..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
            required
          />
          <p className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3" />
            Providing specific error codes and equipment serial numbers accelerates SLA resolution time.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={loading}
            className="bg-brand-900 hover:bg-brand-800 text-white font-bold px-6 py-2 shadow-subtle text-sm"
          >
            Dispatch Incident
          </Button>
        </div>
      </form>
    </div>
  );
}
