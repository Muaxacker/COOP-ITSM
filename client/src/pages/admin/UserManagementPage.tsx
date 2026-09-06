import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, UserCheck, UserX, Pencil, Shield, Building2, Layers } from 'lucide-react';
import { userApi, branchApi, divisionApi } from '../../services/api';
import { Role, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'BRANCH_USER', label: 'Branch Staff / User' },
  { value: 'IT_SUPERVISOR', label: 'IT Supervisor' },
  { value: 'TECHNICIAN', label: 'IT Technician' },
  { value: 'ADMIN', label: 'System Administrator' },
];

const ROLE_COLORS: Record<Role, string> = {
  BRANCH_USER: 'bg-blue-50 text-blue-700 border-blue-200',
  IT_SUPERVISOR: 'bg-purple-50 text-purple-700 border-purple-200',
  TECHNICIAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-amber-50 text-amber-800 border-amber-200',
};

const DEFAULT_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'BRANCH_USER' as Role,
  branchId: '',
  divisionId: '',
  phone: '',
};

export function UserManagementPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dSearch, setDSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', roleFilter, dSearch, page],
    queryFn: async () => {
      const res = await userApi.getUsers({
        role: roleFilter || undefined,
        search: dSearch || undefined,
        page,
        limit: 15,
      });
      return res.data.data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const res = await branchApi.getBranches(true);
      return res.data.data;
    },
  });

  const { data: divisions } = useQuery({
    queryKey: ['divisions-list'],
    queryFn: async () => {
      const res = await divisionApi.getDivisions();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
      };
      if (form.role === 'BRANCH_USER' && form.branchId) {
        payload.branchId = form.branchId;
      }
      if ((form.role === 'TECHNICIAN' || form.role === 'IT_SUPERVISOR') && form.divisionId) {
        payload.divisionId = form.divisionId;
      }
      return userApi.createUser(payload);
    },
    onSuccess: () => {
      toast.success('User account created successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        phone: form.phone.trim() || null,
        branchId: form.role === 'BRANCH_USER' ? form.branchId || null : null,
        divisionId: form.role === 'TECHNICIAN' || form.role === 'IT_SUPERVISOR' ? form.divisionId || null : null,
      };
      return userApi.updateUser(editingUser!.id, payload);
    },
    onSuccess: () => {
      toast.success('User details updated successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update user'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userApi.toggleUserStatus(id),
    onSuccess: (res) => {
      const user = res.data.data;
      toast.success(user?.isActive ? 'User activated' : 'User deactivated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to toggle status'),
  });

  function openCreate() {
    setEditingUser(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branchId: user.branchId || '',
      divisionId: user.divisionId || '',
      phone: user.phone || '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUser(null);
  }

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as any)._us);
    (window as any)._us = setTimeout(() => {
      setDSearch(val);
      setPage(1);
    }, 400);
  }

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage branch personnel, IT technicians, supervisors, and administrative credentials.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | '');
              setPage(1);
            }}
            options={[{ value: '', label: 'All Roles' }, ...ROLE_OPTIONS]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState message="Loading users..." />
      ) : error ? (
        <ErrorState message="Failed to load users" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or role filters." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Branch / Division</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                          ROLE_COLORS[user.role]
                        )}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.role === 'BRANCH_USER' && user.branch ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user.branch.name}</span>
                          <span className="text-gray-400">({user.branch.code})</span>
                        </div>
                      ) : (user.role === 'TECHNICIAN' || user.role === 'IT_SUPERVISOR') && user.division ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Layers className="w-3.5 h-3.5 text-purple-500" />
                          <span>{user.division.name}</span>
                          <span className="font-semibold text-purple-700">({user.division.code})</span>
                        </div>
                      ) : user.role === 'ADMIN' ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700">
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                          <span>Central HQ</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {user.phone || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        )}
                      >
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(user.id)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            user.isActive
                              ? 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                          )}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4 text-rose-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {users.length} of {total} users
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingUser ? 'Edit User Account' : 'Create New User Account'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingUser) updateMutation.mutate();
            else createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Abebe Bikila"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@coopbankoromia.com.et"
          />

          {!editingUser && (
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          )}

          <Select
            label="System Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            options={ROLE_OPTIONS}
          />

          {form.role === 'BRANCH_USER' && (
            <Select
              label="Assigned Bank Branch"
              required
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              options={[
                { value: '', label: 'Select a branch...' },
                ...(branches || []).map((b) => ({
                  value: b.id,
                  label: `${b.name} (${b.code}) - ${b.location}`,
                })),
              ]}
            />
          )}

          {(form.role === 'TECHNICIAN' || form.role === 'IT_SUPERVISOR') && (
            <Select
              label="Assigned IT Technical Division"
              required
              value={form.divisionId}
              onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
              options={[
                { value: '', label: 'Select an IT division...' },
                ...(divisions || []).map((d) => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          )}

          <Input
            label="Contact Phone Number (Optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +251 91 123 4567"
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
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
