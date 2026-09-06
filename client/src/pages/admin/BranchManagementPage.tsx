import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search, Pencil, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { branchApi } from '../../services/api';
import { Branch } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  name: '',
  code: '',
  location: '',
  phone: '',
};

export function BranchManagementPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: branches, isLoading, error } = useQuery({
    queryKey: ['branches-admin'],
    queryFn: async () => {
      const res = await branchApi.getBranches(true);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return branchApi.createBranch({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        location: form.location.trim(),
        phone: form.phone.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Branch added successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['branches-admin'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to add branch'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return branchApi.updateBranch(editingBranch!.id, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        location: form.location.trim(),
        phone: form.phone.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Branch updated successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['branches-admin'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update branch'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (branch: Branch) => {
      return branchApi.updateBranch(branch.id, { isActive: !branch.isActive });
    },
    onSuccess: (res) => {
      toast.success(`Branch ${res.data.data.isActive ? 'activated' : 'deactivated'}`);
      qc.invalidateQueries({ queryKey: ['branches-admin'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to toggle branch status'),
  });

  function openCreate() {
    setEditingBranch(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      phone: branch.phone || '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingBranch(null);
  }

  const filteredBranches = (branches || []).filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bank Branches Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure branches reporting technical problems and banking application incidents.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add New Branch
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by branch name, code, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState message="Loading branches..." />
      ) : error ? (
        <ErrorState message="Failed to load branches" />
      ) : filteredBranches.length === 0 ? (
        <EmptyState title="No branches found" description="Try adjusting your search criteria or add a new branch." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => (
            <Card
              key={branch.id}
              className={cn(
                'p-5 border transition-all hover:shadow-md flex flex-col justify-between',
                branch.isActive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50/75 opacity-75'
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                    {branch.code}
                  </span>
                  <button
                    onClick={() => toggleStatusMutation.mutate(branch)}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium transition-colors',
                      branch.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    )}
                  >
                    {branch.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Inactive
                      </>
                    )}
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  {branch.name}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{branch.location}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="text-gray-400">
                  {branch._count ? (
                    <span>
                      {branch._count.incidents} incidents · {branch._count.users} users
                    </span>
                  ) : (
                    <span>Ethiopia Branch</span>
                  )}
                </div>
                <button
                  onClick={() => openEdit(branch)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit Branch"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingBranch ? 'Edit Bank Branch' : 'Add New Bank Branch'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingBranch) updateMutation.mutate();
            else createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Branch Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Hawassa Central Branch"
          />

          <Input
            label="Branch Code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. BR-001 or BOLE-01"
          />

          <Input
            label="Physical Location / City"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Hawassa, Sidama Region"
          />

          <Input
            label="Contact Phone (Optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +251 46 220 1234"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

