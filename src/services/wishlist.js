// Wishlist service (CS Beverly Hills).
//
// This storefront has NO login. The wishlist lives entirely in localStorage, so
// the heart toggles instantly and the navbar badge works for everyone.
//
// The navbar heart icon hands the saved product IDs off to the EVOKE Marketplace
// wishlist page via the URL (the same pattern as the "Add to Cart" hand-off in
// services/cart.js). The marketplace then adds + shows them on its side — to the
// server wishlist if the shopper is signed in there, otherwise to the
// marketplace's own guest wishlist. No auth/token is needed on this site.
//
//   /account/wishlist?source=csbh&from=header&addWishlistProductIds=1,2,3

const WISH_KEY = 'csbh.wishlist';

// The marketplace account wishlist page. Override with VITE_EVOKE_WISHLIST_URL.
const WISHLIST_URL =
  import.meta.env.VITE_EVOKE_WISHLIST_URL ||
  'https://www.evokemarketplace.com/account/wishlist';
const WISHLIST_SOURCE = 'csbh';

// ── Local (durable) store ────────────────────────────────────────────────────
export function getLocalWishlist() {
  try {
    const ids = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

function setLocalWishlist(ids) {
  try {
    localStorage.setItem(WISH_KEY, JSON.stringify([...new Set(ids.map(String))]));
  } catch {/* storage unavailable */}
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function getWishlist() {
  return getLocalWishlist();
}

export async function addToWishlist(productId) {
  const id = String(productId);
  setLocalWishlist([...getLocalWishlist(), id]);
  return { success: true };
}

export async function removeFromWishlist(productId) {
  const id = String(productId);
  setLocalWishlist(getLocalWishlist().filter((x) => x !== id));
  return { success: true };
}

// ── Marketplace navigation ─────────────────────────────────────────────────────
// Deep-link to the EVOKE Marketplace wishlist page, carrying the locally-saved
// product IDs so the marketplace can add + display them (server or guest
// wishlist). Mirrors the cart hand-off contract (source=csbh).
export function buildEvokeWishlistUrl() {
  const ids = getLocalWishlist();
  const params = new URLSearchParams();
  params.set('source', WISHLIST_SOURCE);
  params.set('from', 'header');
  if (ids.length) params.set('addWishlistProductIds', ids.join(','));
  const sep = WISHLIST_URL.includes('?') ? '&' : '?';
  return `${WISHLIST_URL}${sep}${params.toString()}`;
}

export function redirectToMarketplaceWishlist() {
  window.open(buildEvokeWishlistUrl(), '_blank', 'noopener,noreferrer');
}
