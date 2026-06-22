import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

export default function Auth() {
  const [tab, setTab]           = useState('login');
  const [form, setForm]         = useState({ email: '', password: '', name: '' });
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const { login, register }     = useAuth();
  const navigate                = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-bone flex items-center justify-center px-6 py-16">
      <motion.div
        className="w-full max-w-md bg-white border border-cloud shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-cloud">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 py-4 font-sans text-[10px] tracking-widest uppercase transition-colors ${
                tab === t ? 'text-ink border-b-2 border-gold' : 'text-mist hover:text-steel'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 12 : -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-ink font-light">
                  {tab === 'login' ? 'Welcome Back' : 'Join Us'}
                </h1>
                <p className="font-sans text-xs text-steel mt-2">
                  {tab === 'login'
                    ? 'Sign in to your CS Beverly Hills account.'
                    : 'Create your account to access exclusive benefits.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {tab === 'register' && (
                  <FormField label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} required />
                )}
                <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
                <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />

                {error && (
                  <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} disabled={loading} size="lg" className="w-full mt-2">
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="font-sans text-[11px] text-steel">
                  {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                    className="text-gold hover:underline"
                  >
                    {tab === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-cloud px-8 py-5 bg-bone">
          <p className="font-sans text-[10px] text-mist text-center leading-relaxed">
            By continuing you agree to our{' '}
            <Link to="/terms" className="text-steel hover:text-gold">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-steel hover:text-gold">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, name, type, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-sans text-[10px] tracking-widest uppercase text-steel">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={type === 'password' ? 'current-password' : name}
        className="bg-white border border-cloud text-ink font-sans text-sm px-4 py-3.5 placeholder:text-mist focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}
