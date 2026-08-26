import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Pencil, Plus } from 'lucide-react';
import { getCategories, updateCategory, getDepartments, createCategory } from '../../services/admin.service';
import { ServiceCategory, Priority } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PriorityBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const DEFAULT_FORM = {
  name: '', description: '', departmentId: '',
  defaultDeadlineHours: 24, defaultPriority: 'MEDIUM' as Priority, isActive: true,
};

export function ServiceRulesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => getCategories(true),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({
      name: form.name,
      description: form.description,
      departmentId: form.departmentId,
      defaultDeadlineHours: Number(form.defaultDeadlineHours),
      defaultPriority: form.defaultPriority,
    }),
    onSuccess: () => { toast.success('Category created'); closeModal(); qc.invalidateQueries({ queryKey: ['categories-all'] }); qc.invalidateQueries({ queryKey: ['categories'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCategory(editingCat!.id, {
      name: form.name,
      description: form.description,
      departmentId: form.departmentId,
      defaultDeadlineHours: Number(form.defaultDeadlineHours),
      defaultPriority: form.defaultPriority,
      isActive: form.isActive,
    } as Partial<ServiceCategory>),
    onSuccess: () => { toast.success('Category updated'); closeModal(); qc.invalidateQueries({ queryKey: ['categories-all'] }); qc.invalidateQueries({ queryKey: ['categories'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  function openCreate() {
    setEditingCat(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(cat: ServiceCategory) {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      departmentId: cat.department.id,
      defaultDeadlineHours: cat.defaultDeadlineHours,
      defaultPriority: cat.defaultPriority,
      isActive: cat.isActive,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCat(null);
  }

  const deptOptions = (departments || []).map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Service Rules</h1>
          <p className="text-sm text-text-muted mt-0.5">Configure service categories, deadlines, and responsible departments</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Category</Button>
      </div>

      {/* Description card */}
      <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 flex gap-3">
        <Settings className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-text-primary">Service Deadline Configuration</p>
          <p className="text-xs text-text-muted mt-0.5">
            Each service category has a configured deadline (in hours) that determines how quickly a request must be resolved.
            Deadline status is calculated automatically based on the time remaining.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.map((cat) => (
                <tr key={cat.id} className={cn('hover:bg-gray-50 transition-colors', !cat.isActive && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{cat.name}</p>
                    {cat.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{cat.description}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-text-secondary">{cat.department.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={cat.defaultPriority} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-text-primary">{cat.defaultDeadlineHours}h</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      cat.isActive ? 'text-success' : 'text-text-muted'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', cat.isActive ? 'bg-success' : 'bg-gray-300')} />
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100 hover:text-text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCat ? 'Edit Service Category' : 'Add Service Category'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={() => editingCat ? updateMutation.mutate() : createMutation.mutate()}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!form.name || !form.departmentId}
            >
              {editingCat ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. ATM Services" required />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of this category" />
          <Select
            label="Responsible Department"
            value={form.departmentId}
            onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
            options={deptOptions}
            placeholder="Select department..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deadline (hours)"
              type="number"
              min="1"
              max="720"
              value={String(form.defaultDeadlineHours)}
              onChange={e => setForm(f => ({ ...f, defaultDeadlineHours: parseInt(e.target.value) || 24 }))}
            />
            <Select
              label="Default Priority"
              value={form.defaultPriority}
              onChange={e => setForm(f => ({ ...f, defaultPriority: e.target.value as Priority }))}
              options={PRIORITY_OPTIONS}
            />
          </div>
          {editingCat && (
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded"
              />
              Active (visible to customers)
            </label>
          )}
        </div>
      </Modal>
    </div>
  );
}
