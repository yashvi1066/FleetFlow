import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-fleet-600 to-fleet-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 20v-4l4-2 4 2 4-2 4 2v4l-4 2-4-2-4 2-4-2z" />
              <circle cx={12} cy={10} r={2} strokeWidth={2} />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white font-mono">FleetFlow</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fleet & Logistics Management</h1>
          <p className="text-fleet-100 text-lg max-w-md">
            Centralized digital hub for fleet lifecycle, dispatch, maintenance, and analytics.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-white/80 font-mono">
          <span>Manager</span>
          <span>Dispatcher</span>
          <span>Analyst</span>
          <span>Safety Officer</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-fleet-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 20v-4l4-2 4 2 4-2 4 2v4l-4 2-4-2-4 2-4-2z" />
                <circle cx={12} cy={10} r={2} strokeWidth={2} />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white font-mono">FleetFlow</span>
          </div>
          <div className="rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Sign in</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Role-based access: Manager / Dispatcher / Analyst / Safety Officer</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fleet-500 focus:border-transparent"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fleet-500 focus:border-transparent"
                  autoComplete="current-password"
                />
                <a href="#forgot" className="text-sm text-fleet-600 dark:text-fleet-400 mt-1.5 inline-block hover:underline">Forgot password?</a>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              Demo: admin@fleetflow.io / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
