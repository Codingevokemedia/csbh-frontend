import { createContext, useContext, useState, useCallback } from 'react';
import { addToCart as svcAdd, getCart as svcGet, removeFromCart as svcRemove, updateCartQuantity as svcUpdate, buildEvokeAddToCartUrl } from '../services/cart.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [addedItem, setAddedItem] = useState(null); // for success micro-animation

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const fetchCart = useCallback(async () => {
    try {
      const data = await svcGet();
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }, []);

  // Add item, show success flash, then open the marketplace cart in a NEW tab.
  // The blank tab is opened synchronously here — while we're still inside the
  // click's user gesture — so popup blockers allow it; we point it at the cart
  // URL only after the success flash. (Opening a new tab later, from inside the
  // setTimeout, would otherwise be blocked.)
  const addAndRedirect = useCallback(async ({ productId, variantId, quantity = 1, productTitle, attributes }) => {
    const cartTab = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    setLoading(true);
    try {
      await svcAdd({ productId, variantId, quantity, attributes });
      setAddedItem(productTitle || 'Item');
      await fetchCart();
      setTimeout(() => {
        setAddedItem(null);
        const url = buildEvokeAddToCartUrl({ productId, variantId, quantity, attributes });
        if (cartTab && !cartTab.closed) cartTab.location.href = url;
        else window.open(url, '_blank'); // fallback if the tab was blocked/closed
      }, 1200);
    } catch {
      // silently handled — mock mode or network error. Close the spare tab.
      if (cartTab && !cartTab.closed) cartTab.close();
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Add to cart without redirect (wishlist-to-cart, etc.)
  const addItem = useCallback(async ({ productId, variantId, quantity = 1, productTitle }) => {
    setLoading(true);
    try {
      await svcAdd({ productId, variantId, quantity });
      setAddedItem(productTitle || 'Item');
      await fetchCart();
      setTimeout(() => setAddedItem(null), 2000);
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId) => {
    await svcRemove(cartItemId);
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) { await removeItem(cartItemId); return; }
    await svcUpdate(cartItemId, quantity);
    setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
  }, [removeItem]);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      loading,
      addedItem,
      addItem,
      addAndRedirect,
      removeItem,
      updateQuantity,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
