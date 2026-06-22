import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, getLocalWishlist, addToWishlist, removeFromWishlist } from '../services/wishlist.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

// IDs are compared as strings so a wishlisted product matches whether it arrives
// as a number (backend) or string (local store / product.id).
const asId = (v) => String(v);

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [ids, setIds]             = useState(() => getLocalWishlist());
  const [loading, setLoading]     = useState(false);

  // Always reconcile with the durable store (and the server when signed in).
  useEffect(() => {
    setLoading(true);
    getWishlist()
      .then(setIds)
      .catch(() => setIds(getLocalWishlist()))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const toggle = useCallback(async (productId) => {
    const id = asId(productId);
    const isWishlisted = ids.includes(id);
    // Optimistic update
    setIds(prev => isWishlisted ? prev.filter(x => x !== id) : [...prev, id]);
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch {
      // Rollback on failure
      setIds(prev => isWishlisted ? [...prev, id] : prev.filter(x => x !== id));
    }
  }, [ids]);

  const isWishlisted = useCallback((productId) => ids.includes(asId(productId)), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, loading, toggle, isWishlisted, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
