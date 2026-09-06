import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  User,
  KeyRound,
  Building2,
  Layers,
  CheckCircle2,
  Save,
  Camera,
  Trash2,
  Upload,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Copy,
  Lock,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA State
  const [show2faSetupModal, setShow2faSetupModal] = useState(false);
  const [show2faDisableModal, setShow2faDisableModal] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [enabling2fa, setEnabling2fa] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling2fa, setDisabling2fa] = useState(false);

  // Handle image upload and client-side compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize to max 256x256
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarPreview(compressedDataUrl);
          setAvatarUrl(compressedDataUrl);
          toast.success('Photo selected! Click "Save Profile" to save.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast('Photo cleared. Click "Save Profile" to apply.', { icon: 'ℹ️' });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl,
      });

      const updated = res.data.data;
      updateUser(updated);
      toast.success('Profile updated successfully!');
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

  // 2FA Setup Flow
  const handleOpen2faSetup = async () => {
    setSetupLoading(true);
    try {
      const res = await authApi.setup2fa();
      setTwoFactorSecret(res.data.data.secret);
      setTwoFactorQrCode(res.data.data.qrCodeDataUrl);
      setVerifyCode('');
      setShow2faSetupModal(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize two-factor authentication setup');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleEnable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || verifyCode.trim().length < 6) {
      toast.error('Please enter the full 6-digit code from your authenticator app');
      return;
    }

    setEnabling2fa(true);
    try {
      const res = await authApi.enable2fa({
        secret: twoFactorSecret,
        code: verifyCode.trim(),
      });
      updateUser(res.data.data);
      setShow2faSetupModal(false);
      toast.success('Two-factor authentication successfully enabled on your account!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verification failed. Please check the 6-digit code.');
    } finally {
      setEnabling2fa(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      toast.error('Please enter your account password to confirm');
      return;
    }

    setDisabling2fa(true);
    try {
      const res = await authApi.disable2fa({ password: disablePassword });
      updateUser(res.data.data);
      setShow2faDisableModal(false);
      setDisablePassword('');
      toast.success('Two-factor authentication has been disabled.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to disable 2FA. Incorrect password.');
    } finally {
      setDisabling2fa(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    toast.success('Key copied to clipboard');
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
            My Profile
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Manage your operator profile, avatar photo, contact telephone, and account security credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile & Photo Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-5 h-fit text-center">
          {/* Circular Avatar with Camera Action */}
          <div className="flex flex-col items-center">
            <div className="relative group mx-auto">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name || 'Operator'}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-subtle">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-brand-900 hover:bg-brand-800 text-white rounded-full shadow-md transition-colors border-2 border-white"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <h2 className="text-base font-bold text-slate-900 mt-3">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

            {/* Photo Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-3 text-xs">
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
                <span className="text-slate-500 text-xs mt-0.5 block">{user.branch.location}</span>
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

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block">Two-Factor Security</span>
              {user?.twoFactorEnabled ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  2FA Active (TOTP Protected)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  2FA Not Configured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Details, 2FA, & Change Password */}
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

          {/* Two-Factor Authentication (2FA) Governance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Two-Factor Authentication (2FA)
                </h3>
              </div>
              {user?.twoFactorEnabled ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Protected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Disabled
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enhance account security using standard Time-based One-Time Passwords (TOTP). Compatible with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Apple Keychain</strong> on your mobile device.
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 font-medium">
                {user?.twoFactorEnabled
                  ? 'A 6-digit security code is required whenever you log in.'
                  : 'Add an extra verification layer to safeguard banking operations.'}
              </div>

              {user?.twoFactorEnabled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                  onClick={() => setShow2faDisableModal(true)}
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  loading={setupLoading}
                  className="bg-[#0B2545] hover:bg-[#134074] text-white"
                  onClick={handleOpen2faSetup}
                >
                  <QrCode className="w-3.5 h-3.5 mr-1.5" /> Enable 2FA Security
                </Button>
              )}
            </div>
          </div>

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

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2faSetupModal}
        onClose={() => setShow2faSetupModal(false)}
        title="Configure Two-Factor Authentication"
        size="md"
      >
        <form onSubmit={handleEnable2fa} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-900">Step 1: Scan QR Code with Authenticator</p>
            <p>Open <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or your preferred authenticator app and scan this QR code:</p>
          </div>

          {twoFactorQrCode && (
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg shadow-inner">
              <img src={twoFactorQrCode} alt="2FA QR Code" className="w-48 h-48 rounded" />
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 font-mono">
                <span>Key: <strong className="text-slate-800">{twoFactorSecret}</strong></span>
                <button
                  type="button"
                  onClick={copySecretToClipboard}
                  className="text-brand-900 hover:text-brand-700 ml-1"
                  title="Copy secret key"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step 2: Enter 6-Digit Verification Code
            </label>
            <Input
              type="text"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center font-mono text-lg tracking-widest"
              required
            />
            <p className="text-[11px] text-slate-500">
              Enter the 6 numbers currently shown in your authenticator app to confirm configuration.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShow2faSetupModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={enabling2fa}
              className="bg-[#0B2545] hover:bg-[#134074] text-white"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Verify & Activate 2FA
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2FA Disable Confirmation Modal */}
      <Modal
        isOpen={show2faDisableModal}
        onClose={() => setShow2faDisableModal(false)}
        title="Disable Two-Factor Authentication"
        size="sm"
      >
        <form onSubmit={handleDisable2fa} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              Disabling two-factor authentication decreases your account security. Please verify your current account password to proceed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <Input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShow2faDisableModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={disabling2fa}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm & Disable 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
