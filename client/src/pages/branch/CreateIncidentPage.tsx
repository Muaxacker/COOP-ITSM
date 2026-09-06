import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { branchApi, divisionApi, incidentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DivisionCode } from '../../types';
import toast from 'react-hot-toast';
import { PlusCircle, ArrowLeft, Building2, Layers, AlertCircle, FileText } from 'lucide-react';

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

  const divisionMeta: Record<DivisionCode, { title: string; subtitle: string; icon: string }> = {
    ATM: { title: 'ATM Division', subtitle: 'ATM machines, cash dispensers, card readers', icon: '🏧' },
    APPLICATION: { title: 'Application Division', subtitle: 'Core banking, software, user passwords, malware', icon: '💻' },
    NETWORKING: { title: 'Networking Division', subtitle: 'Internet, switches, routers, cabling, connectivity', icon: '🌐' },
    MAINTENANCE: { title: 'Maintenance Division', subtitle: 'Hardware failure, RAM, hard disks, printers, power', icon: '🔧' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Report IT Incident</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a technical service request or incident from your branch
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Branch Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Originating Bank Branch
          </label>
          <div className="relative">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            >
              <option value="">-- Select Bank Branch --</option>
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
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Responsible IT Division
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
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {meta.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Specific Problem Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              {categories.find((c) => c.id === categoryId)?.description}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            4. Problem Summary / Title
          </label>
          <Input
            placeholder="e.g. Workstation 3 cannot connect to switch or server"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            5. Detailed Description & Symptoms
          </label>
          <Textarea
            placeholder="Describe what happened, error messages displayed, affected workstations or ATMs, and any immediate observations..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Include specific error codes, physical cable conditions, or affected user accounts to accelerate troubleshooting.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-md"
          >
            Submit Incident
          </Button>
        </div>
      </form>
    </div>
  );
}

