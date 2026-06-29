import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { adminLogin, isAdminAuthed } from '../../services/adminAuth.js';
import { logo } from '../../assets/index.js';

// Admin login gate for the CSBH admin dashboard.
export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || '/admin/homepage-products';

  // Already signed in → skip the form.
  if (isAdminAuthed()) return <Navigate to={dest} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80dvh] bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="CS Beverly Hills" className="h-12 w-auto object-contain mb-5" />
          <span className="font-sans text-[10px] tracking-[0.35em] uppercase font-semibold text-gold">Admin</span>
          <h1 className="font-display text-3xl text-ink font-light mt-1">Sign In</h1>
          <p className="font-sans text-sm text-steel mt-2">Sign in with your Evoke admin account to manage homepage products.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-cloud rounded-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-email" className="font-sans text-[11px] tracking-widest uppercase text-steel">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="you@craigshelly.com"
              className="w-full border border-cloud bg-white text-ink font-sans text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-steel"
              style={{ outline: 'none' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="font-sans text-[11px] tracking-widest uppercase text-steel">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-cloud bg-white text-ink font-sans text-sm pl-4 pr-11 py-3 placeholder:text-mist focus:outline-none focus:border-steel"
                style={{ outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-mist hover:text-ink transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="font-sans text-[12px] text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 font-sans text-[12px] font-semibold tracking-widest uppercase border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="font-sans text-[11px] text-mist text-center mt-4">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
