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
    { role: 'Branch User', name: 'Hawassa Branch Teller', email: 'teller.hawassa@coopbank.et', badge: 'bg-emerald-100 text-emerald-800' },
    { role: 'IT Supervisor', name: 'IT Support Supervisor', email: 'supervisor@coopbank.et', badge: 'bg-purple-100 text-purple-800' },
    { role: 'Technician', name: 'Networking Specialist', email: 'tech.network@coopbank.et', badge: 'bg-blue-100 text-blue-800' },
    { role: 'Technician', name: 'ATM Field Engineer', email: 'tech.atm@coopbank.et', badge: 'bg-cyan-100 text-cyan-800' },
    { role: 'Technician', name: 'Application Analyst', email: 'tech.app@coopbank.et', badge: 'bg-indigo-100 text-indigo-800' },
    { role: 'Administrator', name: 'System Administrator', email: 'admin@coopbank.et', badge: 'bg-slate-100 text-slate-800' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0b2545] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-500/30 border border-blue-400/30">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">COOP-ITSM</h1>
          </div>
          <p className="text-base text-blue-200/90 font-medium mt-1">Cooperative Bank of Oromia</p>
          <p className="text-xs text-blue-300/60 mt-0.5">
            IT Service Request & Incident Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sign In to Service Portal</h2>
              <p className="text-xs text-slate-500 mt-0.5">Centralized IT Support for Bank Branches</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bank Intranet
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Bank Email Address"
              type="email"
              placeholder="user@coopbank.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md" size="lg" loading={loading}>
              Sign In to ITSM
            </Button>
          </form>

          {/* Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quick Demo Role Switcher
              </p>
              <span className="text-[11px] text-slate-400">Click to fill credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => fillDemo(item.email)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badge}`}>
                        {item.role}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.email}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-200/50 mt-4">
          Cooperative Bank of Oromia • Academic Internship Project Prototype
        </p>
      </div>
    </div>
  );
}
