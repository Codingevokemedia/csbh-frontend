import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  'Mystery Gift + 3× EGT with every purchase. Limited time.',
  'Free shipping on orders over $500 · Beverly Hills, CA',
  'New arrivals: RAXER Midnight & Sky Tracker — Shop Now',
];

export default function AnnouncementBar() {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);

  // Rotate message every 5s
  useState(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(id);
  });

  if (!visible) return null;

  return (
    <div
      id="announcement-bar"
      className="relative bg-gold text-black text-[11px] font-sans font-semibold tracking-widest uppercase text-center py-2 px-10 select-none"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="inline-block"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>

      <button
        onClick={() => setVisible(false)}
        aria-label="Close announcement"
        className="icon-btn absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
