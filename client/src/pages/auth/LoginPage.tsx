import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
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
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: string) {
    const creds: Record<string, [string, string]> = {
      customer: ['ahmed@bankcare.demo', 'Password123!'],
      officer: ['sara@bankcare.demo', 'Password123!'],
      manager: ['fatima@bankcare.demo', 'Password123!'],
      admin: ['admin@bankcare.demo', 'Password123!'],
    };
    const [e, p] = creds[role] || [];
    if (e) { setEmail(e); setPassword(p); }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">BankCare</h1>
          <p className="text-sm text-text-muted mt-1">Service Request Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-danger-light border border-danger/20 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@bankcare.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Demo quick-fill */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-text-muted text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {['customer', 'officer', 'manager', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="py-1.5 px-3 text-xs font-medium border border-gray-200 rounded-lg text-text-secondary hover:bg-gray-50 hover:border-teal/40 transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted text-center mt-2">Password: Password123!</p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Academic prototype — not connected to real banking systems.
        </p>
      </div>
    </div>
  );
}
