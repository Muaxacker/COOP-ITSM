import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, UserCheck, UserX, Pencil } from 'lucide-react';
import { getUsers, createUser, updateUser, toggleUserStatus, getDepartments } from '../../services/admin.service';
import { Role, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'OFFICER', label: 'Officer' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

const ROLE_COLORS: Record<Role, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-700',
  OFFICER: 'bg-teal/10 text-teal',
  MANAGER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-warning-light text-warning',
};

const DEFAULT_FORM = { name: '', email: '', password: '', role: 'CUSTOMER' as Role, departmentId: '' };

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
    queryFn: () => getUsers({ role: roleFilter || undefined, search: dSearch || undefined, page, limit: 15 }),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: () => createUser({ ...form, departmentId: form.departmentId || undefined }),
    onSuccess: () => { toast.success('User created'); closeModal(); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateUser(editingUser!.id, {
      name: form.name, email: form.email, role: form.role,
      departmentId: form.departmentId || null,
    }),
    onSuccess: () => { toast.success('User updated'); closeModal(); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (res) => {
      toast.success(res.data?.isActive ? 'User activated' : 'User deactivated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error'),
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
      departmentId: user.department?.id || '',
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
    (window as any)._us = setTimeout(() => { setDSearch(val); setPage(1); }, 400);
  }

  const users = data?.users || [];
  const deptOptions = (departments || []).map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-muted mt-0.5">{data?.total ?? 0} total users</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add User</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(1); }}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add User</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className={cn('hover:bg-gray-50 transition-colors', !u.isActive && 'opacity-60')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', ROLE_COLORS[u.role])}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-text-secondary text-xs">
                    {u.department?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', u.isActive ? 'bg-success' : 'bg-gray-300')} />
                      <span className={cn('text-xs font-medium', u.isActive ? 'text-success' : 'text-text-muted')}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100 hover:text-text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(u.id)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          u.isActive
                            ? 'text-text-muted hover:bg-danger-light hover:text-danger'
                            : 'text-text-muted hover:bg-success-light hover:text-success'
                        )}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-text-muted">
              <span>Showing {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)} of {data.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * data.limit >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={() => editingUser ? updateMutation.mutate() : createMutation.mutate()}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sara Ahmed" required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sara@bankcare.demo" required />
          {!editingUser && (
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" required />
          )}
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
            options={ROLE_OPTIONS}
          />
          {(form.role === 'OFFICER' || form.role === 'MANAGER') && (
            <Select
              label="Department"
              value={form.departmentId}
              onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
              options={deptOptions}
              placeholder="Select department..."
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
