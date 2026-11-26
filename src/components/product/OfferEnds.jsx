import { useEffect, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, '0');

// Same wording as evokemarketplace.com: a live countdown in the last 24 hours,
// otherwise "Offer ends today / in N days" by calendar day.
function offerEndsLabel(endMs, nowMs) {
  if (!Number.isFinite(endMs) || nowMs == null) return null;
  const msLeft = endMs - nowMs;
  if (msLeft <= 0) return null;
  if (msLeft <= DAY_MS) {
    const s = Math.floor(msLeft / 1000);
    return `Ends in ${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  const now = new Date(nowMs);
  const end = new Date(endMs);
  const days = Math.round(
    (new Date(end.getFullYear(), end.getMonth(), end.getDate()) -
      new Date(now.getFullYear(), now.getMonth(), now.getDate())) / DAY_MS,
  );
  if (days <= 0) return 'Offer ends today';
  return days === 1 ? 'Offer ends in 1 day' : `Offer ends in ${days} days`;
}

export default function OfferEnds({ endsAt, className, style }) {
  const endMs = endsAt ? new Date(endsAt).getTime() : NaN;
  const [nowMs, setNowMs] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(endMs)) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the clock after hydration
    setNowMs(Date.now());
    const msLeft = endMs - Date.now();
    if (msLeft <= 0 || msLeft > DAY_MS) return undefined;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const label = offerEndsLabel(endMs, nowMs);
  if (!label) return null;
  return (
    <span className={className} style={style} aria-live={label.startsWith('Ends in') ? 'polite' : undefined}>
      {label}
    </span>
  );
}
