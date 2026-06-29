// CSBH Homepage Products service — talks to the Evoke backend feature endpoints
// (/api/csbh-homepage-products). Used by the admin page (manage) and the
// storefront homepage (read active references, then hydrate from the catalogue).
import { apiGet, apiPost, apiPatch, apiDelete } from './api.js';

const BASE = '/csbh-homepage-products';

// Unwrap the backend's { status, message, data } envelope.
const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

// Homepage sections that can be managed from the admin. `target` is how many
// active products that section shows on the homepage.
export const HOMEPAGE_SECTIONS = [
  { key: 'bestsellers', label: 'Bestsellers',  target: 8, blurb: 'Shown in the homepage "Most Loved" grid (2 rows of 4).' },
  { key: 'mens',        label: "Men's",        target: 4, blurb: 'Shown in the "Signature Timepieces" row.' },
  { key: 'womens',      label: "Women's",      target: 4, blurb: 'Shown in the "Crafted for Her" row.' },
];

// List reference rows for a section. activeOnly=true for the storefront.
export async function listHomepageProducts(section, { activeOnly = false } = {}) {
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  if (activeOnly) params.set('active', 'true');
  const res = await apiGet(`${BASE}?${params.toString()}`);
  const rows = unwrap(res);
  return Array.isArray(rows) ? rows : [];
}

// Admin product search by name / ID / SKU (returns { id, name, sku, price, image }).
export async function searchHomepageCandidates(query) {
  const q = String(query || '').trim();
  if (!q) return [];
  const res = await apiGet(`${BASE}/search?q=${encodeURIComponent(q)}`);
  const rows = unwrap(res);
  return Array.isArray(rows) ? rows : [];
}

// Add a product to a section. payload: { product_id, section, display_order?, is_active? }
export async function addHomepageProduct(payload) {
  const res = await apiPost(BASE, payload);
  return unwrap(res);
}

// Update one row: { display_order?, is_active? }
export async function updateHomepageProduct(id, patch) {
  const res = await apiPatch(`${BASE}/${id}`, patch);
  return unwrap(res);
}

// Bulk reorder: items = [{ id, display_order }]
export async function reorderHomepageProducts(items) {
  const res = await apiPatch(`${BASE}/reorder`, { items });
  return unwrap(res);
}

// Remove a row.
export async function removeHomepageProduct(id) {
  const res = await apiDelete(`${BASE}/${id}`);
  return unwrap(res);
}
