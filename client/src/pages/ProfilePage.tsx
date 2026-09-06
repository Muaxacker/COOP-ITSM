import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatDateTime } from '../utils';
import toast from 'react-hot-toast';
import {
  User,
  Shield,
  KeyRound,
  Building2,
  Layers,
  Phone,
  Mail,
  CheckCircle2,
  Save,
} from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setUpdatingProfile(true);
    try {
      await authApi.updateProfile({ name: name.trim(), phone: phone.trim() });
      toast.success('Profile updated successfully');
      // Update cached user in localStorage
      const cached = localStorage.getItem('coop_itsm_user') || localStorage.getItem('bankcare_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.name = name.trim();
        parsed.phone = phone.trim();
        localStorage.setItem('coop_itsm_user', JSON.stringify(parsed));
        localStorage.setItem('bankcare_user', JSON.stringify(parsed));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
              Personnel Settings
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">Cooperative Bank of Oromia</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            My Profile & Security Console
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Manage your authenticated operator profile, contact telephone, and account security credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-5 h-fit">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-subtle">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block">Assigned Role</span>
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>

            {user?.branch && (
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block">Assigned Branch</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {user.branch.name} ({user.branch.code})
                </span>
                <span className="text-slate-500 text-[11px]">{user.branch.location}</span>
              </div>
            )}

            {user?.division && (
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block">Technical Division</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <Layers className="w-4 h-4 text-slate-500" />
                  {user.division.name} ({user.division.code})
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block">Account Status</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active & Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Details & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <User className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Contact Phone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 234 5678"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" loading={updatingProfile} className="bg-brand-900 hover:bg-brand-800 text-white">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Profile
              </Button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Update Password
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" loading={changingPassword} className="bg-brand-900 hover:bg-brand-800 text-white">
                <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
