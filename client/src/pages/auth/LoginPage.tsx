import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  HelpCircle,
  X,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('coop_itsm_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your corporate email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('coop_itsm_remembered_email', email.trim());
      } else {
        localStorage.removeItem('coop_itsm_remembered_email');
      }

      await login(email.trim(), password);
      toast.success('Authenticated successfully. Welcome to COOP-ITSM!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Authentication failed. Please verify your credentials or contact IT Service Desk.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A101D] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900/90 rounded-xl mb-3.5 border border-slate-800 shadow-xl text-brand-400">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            COOP-ITSM
          </h1>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            Cooperative Bank of Oromia
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Enterprise IT Incident & Service Management Portal
          </p>
        </div>

        {/* Real Enterprise Login Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-modal p-6 sm:p-8">
          <div className="mb-5 pb-3.5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Enterprise Authentication
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Authorized bank staff and IT personnel only
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-medium text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="user.adama@coopbank.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Account Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-900 focus:ring-brand-900"
                />
                <span className="font-medium text-slate-700">Remember email</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-brand-900 hover:text-brand-700 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-white font-bold py-2.5 text-sm shadow-subtle flex items-center justify-center gap-2"
                size="md"
                loading={loading}
              >
                <span>Sign In to Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Compliance & Security Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 rounded-b-xl border-t border-slate-200/60 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold text-slate-700">Official Banking System:</strong> Access is restricted to authenticated Cooperative Bank of Oromia personnel. Unauthorized access attempts are logged and monitored under National Bank of Ethiopia cybersecurity directives.
            </p>
          </div>
        </div>

        {/* Footer & Support Callout */}
        <p className="text-center text-xs text-slate-400 font-medium mt-5">
          Need technical assistance? Contact IT Service Desk Ext: <span className="text-slate-300 font-mono font-bold">4400</span>
        </p>
        <p className="text-center text-xs text-slate-500 font-medium mt-2">
          Cooperative Bank of Oromia · Centralized IT Incident Operations · Version 2.4.0
        </p>
      </div>

      {/* Enterprise Password Reset Policy Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-900 border border-brand-100">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Credential Reset Assistance</h3>
                  <p className="text-xs text-slate-500">Cooperative Bank of Oromia IT Policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                In compliance with banking security standards, self-service automated password resets are disabled for corporate operator accounts.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800">To reset your account password:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Contact your branch manager or division supervisor to verify identity.</li>
                  <li>Reach out directly to the Central IT Service Desk.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-800" />
                  <span>Internal Ext: <strong className="font-mono text-slate-900">4400</strong></span>
                </div>
                <div className="text-slate-500 font-mono">
                  support@coopbank.et
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowForgotModal(false)}
              >
                Understood, Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
