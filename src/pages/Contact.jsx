import { useState } from 'react';
import { submitContactEnquiry } from '../services/contact.js';

export default function Contact() {
  const [form, setForm] = useState({ email: '', name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitContactEnquiry(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0">
        {/* Left: form */}
        <div className="pr-0 lg:pr-16">
          <h1 className="font-sans text-2xl font-bold text-ink mb-1">Contact Us</h1>
          <p className="font-sans text-sm text-steel mb-8">Please enter your e-mail and password:</p>

          {submitted ? (
            <div className="py-10">
              <p className="font-sans text-sm text-ink font-medium">Thank you! We will be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Your Email"
                  className="flex-1 min-w-0 border border-cloud bg-white text-ink font-sans text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-steel"
                />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="flex-1 min-w-0 border border-cloud bg-white text-ink font-sans text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-steel"
                />
              </div>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                minLength={10}
                placeholder="Your message"
                rows={8}
                className="border border-cloud bg-white text-ink font-sans text-sm px-4 py-3 placeholder:text-mist focus:outline-none focus:border-steel resize-none"
              />
              {error && (
                <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-sans text-[13px] font-semibold tracking-widest uppercase border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 disabled:opacity-60 active:scale-[0.97]"
              >
                {loading ? 'Sending...' : 'SEND MESSAGE'}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-cloud mx-8" />

        {/* Right: office info */}
        <div className="pt-2 lg:pt-14">
          <p className="font-sans text-[11px] tracking-widest uppercase text-mist mb-2">CORPORATE OFFICE</p>
          <h2 className="font-sans text-xl font-bold text-ink mb-4">CS BEVERLY HILLS</h2>
          <p className="font-sans text-sm text-steel mb-3">Beverly Hills CA 90210</p>
          <p className="font-sans text-sm text-steel mb-1">support@craigshelly.com</p>
          <p className="font-sans text-sm text-steel">562-472-1111</p>
        </div>
      </div>
    </div>
  );
}
