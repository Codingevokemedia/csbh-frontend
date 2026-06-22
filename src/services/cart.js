// Cart service — add items and redirect to EVOKE Marketplace cart.
// PLACEHOLDER endpoints: map to real EVOKE cart API when available.

import { apiGet, apiPut, apiDelete, isMockMode } from './api.js';

const CART_URL     = import.meta.env.VITE_EVOKE_CART_URL     || 'https://www.evokemarketplace.com/mainCart';
const CHECKOUT_URL = import.meta.env.VITE_EVOKE_CHECKOUT_URL || 'https://www.evokemarketplace.com/checkout';

// Attribution tag read by the EVOKE marketplace cart page (?source=).
const CART_SOURCE = 'csbh';

const MOCK_CART_KEY = 'csbh.mock.cart';

// Builds the URL that "Add to Cart" sends the shopper to. The EVOKE marketplace
// cart page reads addProductId/qty/variantId/source, signs the user in if
// needed, and adds the item before rendering the cart — same flow as Kich.
export function buildEvokeAddToCartUrl({ productId, variantId, quantity = 1, attributes } = {}) {
  if (productId == null) return CART_URL;
  const params = new URLSearchParams();
  params.set('addProductId', String(productId));
  params.set('qty', String(quantity || 1));
  // Only forward a variant when it's a real, distinct variant id (our products
  // default variantId to the product id when there are no real variants).
  if (variantId != null && String(variantId) !== String(productId)) {
    params.set('variantId', String(variantId));
  }
  // Forward the shopper's selected attributes so the marketplace cart can apply
  // the chosen combination (e.g. Band Color, Strap Length). Sent as compact JSON.
  if (attributes && Object.keys(attributes).length) {
    params.set('attributes', JSON.stringify(attributes));
  }
  params.set('source', CART_SOURCE);
  const sep = CART_URL.includes('?') ? '&' : '?';
  return `${CART_URL}${sep}${params.toString()}`;
}

function getMockCart() {
  try { return JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]'); }
  catch { return []; }
}

function setMockCart(items) {
  try { localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items)); }
  catch {/* ignore */}
}

// The EVOKE marketplace owns the real cart — external storefronts don't POST
// to a cart API; the item is added on the marketplace via the redirect
// deep-link (see redirectToMarketplaceCart). So in live mode this just resolves
// successfully and the redirect carries the product. Mock mode keeps a local
// cart for offline development.
export async function addToCart({ productId, variantId, quantity = 1, attributes }) {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 400));
    const cart = getMockCart();
    const existing = cart.find(i => i.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
      if (attributes) existing.attributes = attributes;
    } else {
      cart.push({ productId, variantId, quantity, attributes, id: `item_${Date.now()}` });
    }
    setMockCart(cart);
    return { success: true, cartItems: cart };
  }
  return { success: true, productId, variantId, quantity, attributes };
}

// PLACEHOLDER endpoint: GET /cart
export async function getCart() {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 200));
    return { items: getMockCart() };
  }
  return apiGet('/cart');
}

// PLACEHOLDER endpoint: PUT /cart/items/:itemId
export async function updateCartQuantity(cartItemId, quantity) {
  if (isMockMode()) {
    const cart = getMockCart();
    const item = cart.find(i => i.id === cartItemId);
    if (item) item.quantity = quantity;
    setMockCart(cart);
    return { success: true, cartItems: cart };
  }
  return apiPut(`/cart/items/${cartItemId}`, { quantity });
}

// PLACEHOLDER endpoint: DELETE /cart/items/:itemId
export async function removeFromCart(cartItemId) {
  if (isMockMode()) {
    const cart = getMockCart().filter(i => i.id !== cartItemId);
    setMockCart(cart);
    return { success: true, cartItems: cart };
  }
  return apiDelete(`/cart/items/${cartItemId}`);
}

// Redirect to the EVOKE Marketplace cart. Pass { productId, variantId, quantity }
// to add that item on arrival; call with no args to just open the cart.
export function redirectToMarketplaceCart(opts = {}) {
  window.location.href = buildEvokeAddToCartUrl(opts);
}

// Open EVOKE checkout directly in a new tab.
export function redirectToCheckout() {
  window.open(CHECKOUT_URL, '_blank');
}
