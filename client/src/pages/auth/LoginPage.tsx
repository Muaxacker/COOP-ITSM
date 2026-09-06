import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Server, ShieldCheck, ArrowRight } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to COOP-ITSM!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(e: string, p = 'Password123!') {
    setEmail(e);
    setPassword(p);
  }

  const demoAccounts = [
    { role: 'Branch User', name: 'Hawassa Branch Staff', email: 'teller.hawassa@coopbank.et', division: 'Hawassa (BR001)' },
    { role: 'IT Supervisor', name: 'IT Support Supervisor', email: 'supervisor@coopbank.et', division: 'Central Operations' },
    { role: 'Technician', name: 'Network Specialist', email: 'tech.network@coopbank.et', division: 'Networking Division' },
    { role: 'Technician', name: 'ATM Field Engineer', email: 'tech.atm@coopbank.et', division: 'ATM Support Division' },
    { role: 'Technician', name: 'Application Analyst', email: 'tech.app@coopbank.et', division: 'Application Division' },
    { role: 'Administrator', name: 'System Administrator', email: 'admin@coopbank.et', division: 'HQ IT Directorate' },
  ];

  return (
    <div className="min-h-screen bg-[#0A101D] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800/90 rounded-md mb-3 border border-slate-700 shadow-subtle text-slate-100">
            <Server className="w-6 h-6 text-slate-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">COOP-ITSM</h1>
          <p className="text-sm text-slate-200 font-semibold mt-0.5">Cooperative Bank of Oromia</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            IT Service Request & Incident Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-modal p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Enterprise Authentication</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Authorized bank staff and IT personnel only</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Secure Network
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="user@coopbank.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Account Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              }
            />
            <div className="pt-1">
              <Button type="submit" className="w-full" size="md" loading={loading}>
                Sign In to Workstation
              </Button>
            </div>
          </form>

          {/* Demo Credentials Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Authorized Demo Role Selector
              </p>
              <span className="text-xs text-slate-500 font-mono font-medium">Click to prefill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {demoAccounts.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => fillDemo(item.email)}
                  className="text-left p-2 rounded border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {item.role}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{item.division}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-700 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-4">
          Cooperative Bank of Oromia · Centralized IT Incident Operations
        </p>
      </div>
    </div>
  );
}
