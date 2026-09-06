import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Pencil, Clock, CheckCircle2, XCircle, Tag, ShieldAlert } from 'lucide-react';
import { divisionApi } from '../../services/api';
import { Division, IncidentCategory, Priority, DivisionCode } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { PriorityBadge, DivisionBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const DEFAULT_FORM = {
  divisionId: '',
  name: '',
  description: '',
  defaultPriority: 'MEDIUM' as Priority,
  defaultSlaHours: 8,
  isActive: true,
};

export function DivisionCategoryPage() {
  const qc = useQueryClient();
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncidentCategory | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: divisions, isLoading: divLoading, error: divError } = useQuery({
    queryKey: ['divisions-admin'],
    queryFn: async () => {
      const res = await divisionApi.getDivisions();
      return res.data.data;
    },
  });

  const { data: categories, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: async () => {
      const res = await divisionApi.getCategories();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return divisionApi.createCategory({
        divisionId: form.divisionId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        defaultPriority: form.defaultPriority,
        defaultSlaHours: Number(form.defaultSlaHours),
      });
    },
    onSuccess: () => {
      toast.success('Incident category created successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['categories-admin'] });
      qc.invalidateQueries({ queryKey: ['divisions-admin'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return divisionApi.updateCategory(editingCategory!.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        defaultPriority: form.defaultPriority,
        defaultSlaHours: Number(form.defaultSlaHours),
        isActive: form.isActive,
      });
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['categories-admin'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update category'),
  });

  function openCreate() {
    setEditingCategory(null);
    setForm({
      ...DEFAULT_FORM,
      divisionId: selectedDivisionId !== 'ALL' ? selectedDivisionId : divisions?.[0]?.id || '',
    });
    setShowModal(true);
  }

  function openEdit(cat: IncidentCategory) {
    setEditingCategory(cat);
    setForm({
      divisionId: cat.divisionId,
      name: cat.name,
      description: cat.description || '',
      defaultPriority: cat.defaultPriority,
      defaultSlaHours: cat.defaultSlaHours,
      isActive: cat.isActive,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCategory(null);
  }

  if (divLoading || catLoading) return <LoadingState message="Loading IT division configurations..." />;
  if (divError || catError) return <ErrorState message="Failed to load divisions and categories" />;

  const allCategories = categories || [];
  const filteredCategories =
    selectedDivisionId === 'ALL'
      ? allCategories
      : allCategories.filter((c) => c.divisionId === selectedDivisionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Divisions & Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure technical divisions, incident diagnostic categories, and SLA resolution deadlines.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="bg-brand-900 hover:bg-brand-800 text-white">
          Add Category
        </Button>
      </div>

      {/* Divisions Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        <button
          onClick={() => setSelectedDivisionId('ALL')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors',
            selectedDivisionId === 'ALL'
              ? 'bg-[#0b2545] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          )}
        >
          All Divisions ({allCategories.length})
        </button>
        {(divisions || []).map((div) => {
          const count = allCategories.filter((c) => c.divisionId === div.id).length;
          return (
            <button
              key={div.id}
              onClick={() => setSelectedDivisionId(div.id)}
              className={cn(
                'px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5',
                selectedDivisionId === div.id
                  ? 'bg-brand-900 text-white shadow-subtle'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <span>{div.name}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  selectedDivisionId === div.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No incident categories found"
          description="There are no categories configured for this division yet."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Division</th>
                  <th className="px-5 py-3.5">Default Priority</th>
                  <th className="px-5 py-3.5">SLA Target</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {cat.division ? (
                        <DivisionBadge code={cat.division.code} name={cat.division.name} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={cat.defaultPriority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cat.defaultSlaHours} hours</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCategory ? 'Edit Incident Category' : 'Create Incident Category'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingCategory) updateMutation.mutate();
            else createMutation.mutate();
          }}
          className="space-y-4"
        >
          {!editingCategory && (
            <Select
              label="Assigned Division"
              required
              value={form.divisionId}
              onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
              options={[
                { value: '', label: 'Select IT Division...' },
                ...(divisions || []).map((d) => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          )}

          <Input
            label="Category Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Card Reader Hardware Jam"
          />

          <Textarea
            label="Description (Optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Diagnostic guidance or description of this failure type..."
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Default Priority"
              value={form.defaultPriority}
              onChange={(e) => setForm({ ...form, defaultPriority: e.target.value as Priority })}
              options={PRIORITY_OPTIONS}
            />

            <Input
              label="Default SLA Target (Hours)"
              type="number"
              min="1"
              max="720"
              required
              value={form.defaultSlaHours}
              onChange={(e) => setForm({ ...form, defaultSlaHours: Number(e.target.value) })}
            />
          </div>

          {editingCategory && (
            <div className="pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Active category (available for branch incident reporting)</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="bg-brand-900 hover:bg-brand-800 text-white"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

