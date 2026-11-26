import { useState } from 'react';
import styles from './ProductExtras.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Back-in-stock sign-up shown on a sold-out product (POST /product/notify). */
export default function NotifyMe({ productId, submitNotify, style }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ ok: false, text: 'Enter a valid email address.' });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      await submitNotify({ productId, email: value });
      setStatus({ ok: true, text: "Thank you. We'll email you as soon as it's back in stock." });
      setEmail('');
    } catch {
      setStatus({ ok: false, text: 'Could not save your request. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.block} style={style} aria-labelledby="notify-me-heading">
      <h2 id="notify-me-heading" className={styles.heading}>Notify me when available</h2>
      {status?.ok ? (
        <p className={styles.success} role="status" style={{ margin: 0 }}>{status.text}</p>
      ) : (
        <form className={styles.notifyForm} onSubmit={handleSubmit} noValidate>
          <label htmlFor="notify-me-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Email address
          </label>
          <input
            id="notify-me-email"
            type="email"
            className={styles.input}
            placeholder="your@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className={styles.solidBtn} disabled={sending}>
            {sending ? 'Saving…' : 'Notify me'}
          </button>
        </form>
      )}
      {status && !status.ok && <p className={styles.error} role="alert" style={{ margin: 0 }}>{status.text}</p>}
    </section>
  );
}
