import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart, redirectToMarketplaceCart } from '../services/cart.js';
import { logo } from '../assets/index.js';

export default function CartBridge() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('adding');

  const productId = searchParams.get('productId');
  const variantId = searchParams.get('variantId');
  const quantity  = Number(searchParams.get('qty')) || 1;

  useEffect(() => {
    if (!productId) {
      setStatus('error');
      return;
    }
    addToCart({ productId, variantId, quantity })
      .then(() => {
        setStatus('redirecting');
        setTimeout(() => redirectToMarketplaceCart({ productId, variantId, quantity }), 600);
      })
      .catch(() => setStatus('error'));
  }, [productId, variantId, quantity]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-8 px-6">
      <img src={logo} alt="CS Beverly Hills" className="h-12 w-auto" />

      {status === 'error' ? (
        <motion.div
          className="text-center flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-display text-2xl text-ink font-light">Something went wrong</p>
          <p className="font-sans text-sm text-steel">We could not add that item to your cart. Please go back and try again.</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-gold text-gold font-sans text-[11px] tracking-widest uppercase px-7 py-3.5 hover:bg-gold hover:text-white transition-all duration-200 mt-2"
          >
            Go Back
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="text-center flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Spinner */}
          <div className="relative w-14 h-14">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cloud"
              style={{ borderTopColor: '#CA8A04' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl text-ink font-light">
              {status === 'adding' ? 'Adding to your cart...' : 'Redirecting to checkout...'}
            </p>
            <p className="font-sans text-xs text-mist">
              You will be taken to EVOKE Marketplace to complete your purchase.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
