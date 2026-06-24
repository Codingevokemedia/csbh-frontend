// Product service — fetches CS Beverly Hills products from the EVOKE Marketplace
// backend (the same backend the Kich storefront uses) and maps them into the
// internal product shape the UI expects. Falls back to bundled mock data if the
// network/API is unavailable, so the design always renders.

import { apiGet, isMockMode } from './api.js';
import {
  mockProducts,
  getFeaturedMockProducts,
  getMockNewArrivals,
  getMockMensProducts,
  getMockWomensProducts,
  getMockLimitedEditions,
  getMockBestSellers,
  getMockProductBySlug,
  getMockProductById,
} from '../data/mockProducts.js';

// The storefront's source store. The backend matches StoreName EXACTLY
// (case-insensitive). Override the name via env if it ever differs.
const STORE_NAME = import.meta.env.VITE_CSBH_STORE_NAME || 'CS Beverly Hills';
// Known CS Beverly Hills VendorID on the EVOKE backend. Used as a fallback so
// the global featured endpoints (best sellers / new collections) stay scoped to
// this store even when StoreName casing/spacing drifts. Extend via env.
const KNOWN_CSBH_VENDOR_IDS = ['2411002'];
// Optional comma-separated VendorID allowlist — merged with the known default.
const VENDOR_IDS = [
  ...KNOWN_CSBH_VENDOR_IDS,
  ...String(import.meta.env.VITE_CSBH_VENDOR_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
];

const STORE_TARGET = STORE_NAME.trim().toLowerCase();
const VENDOR_TARGETS = new Set(VENDOR_IDS.map((v) => String(v)));

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

// Lifestyle/editorial images are served from the bulk-product S3 bucket, while
// technical product photos come from the main evoke bucket. The backend returns
// both in one PhotosAndVideos list, so the host is what distinguishes them.
const LIFESTYLE_HOST = 'bulkproduct-images';
const isLifestyleUrl = (u) => String(u || '').includes(LIFESTYLE_HOST);

// A media URL is a video when it points at a video file (the page-builder slots
// and photo lists can hold either images or videos).
const isVideoUrl = (u) => /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(String(u || ''));

// True when a raw/normalized product belongs to the CS Beverly Hills store.
// Matches on VendorID (when an allowlist is configured) first, then on an exact
// StoreName match — works on every endpoint's row shape.
function isStoreProduct(raw) {
  if (!raw) return false;
  const vendor = raw.VendorID ?? raw.vendorId ?? null;
  if (VENDOR_TARGETS.size && vendor != null && VENDOR_TARGETS.has(String(vendor))) {
    return true;
  }
  const store = raw.StoreName ?? raw.storeName ?? '';
  return String(store).trim().toLowerCase() === STORE_TARGET;
}

// ── Section classification ─────────────────────────────────────────────────
// We can't rely on EVOKE having CS-specific "mens/womens" tags, so we classify
// each product from its name + category/sub-category names. A watch brand's
// default (no gender keyword) leans men's; jewelry/cufflinks route to their
// dedicated pages.
function classify(name, categoryName, subCategoryName) {
  const cat = (categoryName || '').toLowerCase();
  const sub = (subCategoryName || '').toLowerCase();
  const s = `${name || ''} ${cat} ${sub}`.toLowerCase();

  // 1) Cufflinks — specific accessory, route to the men's cufflinks page.
  if (/cuff[\s-]?link/.test(s)) {
    return { category: 'cufflinks', collection: 'mens-cufflinks' };
  }
  // 2) Trust the explicit watch sub-category gender FIRST (e.g. sub-category
  //    "Women's Watches" / "Men's Watches"). This must beat the jewelry check
  //    so a women's watch never gets misrouted to jewelry by a stray keyword.
  if (/wom[ae]n|ladies|lady/.test(sub)) {
    return { category: 'watches', collection: 'womens' };
  }
  if (/\bmen|\bman\b|gentlem/.test(sub)) {
    return { category: 'watches', collection: 'mens' };
  }
  // 3) Jewelry — by category ("Jewelry"), a jewelry-type sub-category, or a
  //    jewelry keyword in the name.
  if (
    cat.includes('jewel') ||
    /necklace|earring|\bring|bracelet|bangle|pendant|brooch|charm|jewel/.test(s)
  ) {
    return { category: 'jewelry', collection: 'womens-jewelry' };
  }
  // 4) Fall back to gender hints anywhere in the text (uncategorised watches).
  if (/\bwomen|\bwoman|ladies|\blady\b|\bher\b|female/.test(s)) {
    return { category: 'watches', collection: 'womens' };
  }
  if (/\bmen|\bman\b|\bhis\b|gentlem|male/.test(s)) {
    return { category: 'watches', collection: 'mens' };
  }
  // Default: a timepiece with no gender signal → men's collection.
  return { category: 'watches', collection: 'mens' };
}

// Maps a raw EVOKE product row to the internal shape. `catMap`/`subMap` resolve
// CategoryID/SubCategoryID → name so we can classify the product.
export function normalizeProduct(raw, catMap = null, subMap = null, attributes = []) {
  if (!raw) return null;

  const id = raw.ProductID ?? raw.id ?? raw._id ?? '';
  const title = raw.ProductName ?? raw.title ?? raw.name ?? '';
  const price = Number(raw.PriceInUSD ?? raw.price ?? 0) || 0;
  const compareAtPrice =
    raw.RegularPrice && Number(raw.RegularPrice) > price
      ? Number(raw.RegularPrice)
      : raw.compareAtPrice
      ? Number(raw.compareAtPrice)
      : null;

  // ── Images ──────────────────────────────────────────────────────────────
  // The backend merges lifestyle/model shots INTO PhotosAndVideos, but they're
  // stored in a different S3 bucket than technical product photos:
  //   • product shots  → s3-evokemarketplace.s3...
  //   • lifestyle shots → bulkproduct-images.s3...  (the productlifestyleimage table)
  // So we split by host: product shots feed the gallery, lifestyle shots feed
  // their own section. (Also honours an explicit LifestyleImages field if the
  // backend ever returns one.)
  // `ImageMapPath`/`ImagePath` are the top-level image fields returned by the
  // search endpoint (which omits PrimaryImage/PhotosAndVideos) — without them
  // search-result thumbnails fall back to the placeholder. `ProductNFTImage` is
  // intentionally NOT in this chain: it's a separate blockchain token image (on
  // a different host) and listing it here prepends it to the real product
  // photos as an extra gallery thumbnail. It's only used as a last-resort
  // fallback below, when a product has no actual photos.
  let image =
    raw.PrimaryImage || raw.ImageMapPath || raw.ImagePath ||
    raw.image || raw.thumbnail || '';
  const photoList =
    raw.PhotosAndVideos || raw.ProductImages || raw.images || raw.gallery || [];
  const allPhotoUrls = (Array.isArray(photoList) ? photoList : [])
    .map((p) => p?.ImageMapPath || p?.ImagePath || p?.MediaUrl || p?.url || p?.Url || (typeof p === 'string' ? p : null))
    .filter(Boolean);

  const lifestyleFromPhotos = allPhotoUrls.filter(isLifestyleUrl);
  let gallery = allPhotoUrls.filter((u) => !isLifestyleUrl(u));

  if (!image || isLifestyleUrl(image)) image = gallery[0] || raw.ProductNFTImage || PLACEHOLDER;
  if (!gallery.length) gallery = [image];
  // De-dupe while preserving order; keep the primary image first, no lifestyle.
  gallery = Array.from(new Set([image, ...gallery])).filter((u) => u && !isLifestyleUrl(u));

  // Explicit lifestyle field (ordered by ImageOrder) + those split from photos.
  const rawLifestyle = raw.LifestyleImages || raw.lifestyleImages || [];
  const explicitLifestyle = (Array.isArray(rawLifestyle) ? rawLifestyle : [])
    .slice()
    .sort((a, b) => Number(a?.ImageOrder ?? 0) - Number(b?.ImageOrder ?? 0))
    .map((p) => (typeof p === 'string' ? p : p?.ImageUrl || p?.url || p?.ImageMapPath))
    .filter(Boolean);
  const lifestyleImages = Array.from(new Set([...explicitLifestyle, ...lifestyleFromPhotos]))
    .filter((u) => !isVideoUrl(u));

  // Product videos live in the page-builder media slots (each holds an image OR
  // a video). Pull any video URLs so the detail page can show them under the
  // "About product" section.
  const pbBlocks = Array.isArray(raw.PageBuilderData) ? raw.PageBuilderData : [];
  const pbMedia = pbBlocks
    .flatMap((b) => [b?.LeftDisplayImageorVideoOne, b?.RightDisplayImageorVideoTwo])
    .filter(Boolean);
  const videos = Array.from(new Set([...allPhotoUrls, ...pbMedia].filter(isVideoUrl)));

  // Rich "About product" copy lives in the page-builder blocks
  // (DescriptionOne / DescriptionTwo) — this is the long marketing write-up,
  // separate from the short ProductDescription used elsewhere. Falls back to
  // the plain description when no page-builder copy exists.
  const aboutDescription = pbBlocks
    .flatMap((b) => [b?.DescriptionOne, b?.DescriptionTwo])
    .filter((d) => d && String(d).trim())
    .join('\n\n');

  // Long SEO-style heading for the "About product" tab, also from the
  // page-builder blocks (HeaderTextOne / HeaderTextTwo). Falls back to the plain
  // product name.
  const aboutTitle = pbBlocks
    .flatMap((b) => [b?.HeaderTextOne, b?.HeaderTextTwo])
    .find((t) => t && String(t).trim()) || '';

  const categoryName = catMap ? catMap.get(Number(raw.CategoryID)) : null;
  const subName = subMap ? subMap.get(Number(raw.SubCategoryID)) : null;
  const { category, collection } = classify(title, categoryName, subName);

  // ── Availability ──────────────────────────────────────────────────────────
  // Stock is driven by AvalabilityStatusID (1=InStock, 2=LowStock, 3=OutOfStock)
  // and ProductStockQuantity — NOT StatusID, which is the Active/Inactive flag.
  const availId = Number(raw.AvalabilityStatusID ?? raw.AvailabilityStatusID ?? 0);
  const stockQuantity =
    raw.ProductStockQuantity != null ? Number(raw.ProductStockQuantity)
    : raw.StockQuantity != null ? Number(raw.StockQuantity)
    : null;
  let inStock;
  if (availId) inStock = availId !== 3;
  else if (stockQuantity != null) inStock = stockQuantity > 0;
  else if (raw.StatusID != null) inStock = Number(raw.StatusID) === 1;
  else inStock = true;
  const availabilityStatus =
    availId === 1 ? 'InStock'
    : availId === 2 ? 'LowStock'
    : availId === 3 ? 'OutOfStock'
    : inStock ? 'InStock' : 'OutOfStock';

  // ── Attributes / specs ──────────────────────────────────────────────────
  // Build BOTH an ordered list (for the spec table, respecting DisplayOrder and
  // hiding blanks) and a key→value object (back-compat with existing UI). Source
  // is the dynamic Attributes array; never hardcoded.
  const attrList = [];
  const specs = { ...(raw.specs || {}) };
  if (Array.isArray(attributes) && attributes.length) {
    attributes
      .slice()
      .sort((a, b) => Number(a?.DisplayOrder ?? 999) - Number(b?.DisplayOrder ?? 999))
      .forEach((attr) => {
        const name = (attr.CategoryAttributeName || attr.AttributeName || '').trim();
        const val = (attr.AttributeValues || attr.CategoryAttributeValues || '').toString().trim();
        if (!name || !val) return;
        if (!attrList.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
          attrList.push({ name, value: val });
        }
        specs[name] = val;
      });
  } else {
    // No structured attributes from the API — surface any pre-existing specs
    // object (e.g. mock data) as the ordered list too.
    Object.entries(specs).forEach(([name, value]) => {
      if (value) attrList.push({ name, value: String(value) });
    });
  }

  return {
    id: String(id),
    title,
    // Detail pages resolve by id, so the slug IS the id — links stay stable
    // without a separate slug/handle field on the backend.
    slug: String(id),
    price,
    compareAtPrice,
    image,
    gallery,
    lifestyleImages,
    videos,
    category,
    collection,
    tags: [],
    description: raw.ProductDescription || raw.description || '',
    // Long page-builder marketing copy for the "About product" tab; falls back
    // to the short description so the tab is never empty.
    aboutDescription: aboutDescription || raw.ProductDescription || raw.description || '',
    // Long SEO-style heading for the "About product" tab; falls back to title.
    aboutTitle: aboutTitle || title,
    specs,
    attributes: attrList,
    variants: [],
    inStock,
    stockQuantity,
    availabilityStatus,
    isNew: raw.IsNewCollections === 1 || raw.IsNewCollections === true || false,
    isLimitedEdition: false,
    isBestSeller: raw.IsBestSeller === 1 || raw.IsBestSeller === true || false,
    limitedEditionNote: null,
    // Commerce / detail fields (dynamic — blank when the backend omits them).
    sku: raw.ProductSKU || raw.sku || null,
    brand: raw.BrandName || null,
    warranty: raw.WarrantyPeriod || null,
    disclaimer: raw.Disclaimer || null,
    gender: raw.Gender || null,
    condition: raw.Condition || null,
    countryOrigin: raw.CountryOrigin || null,
    coaImage: raw.ProductCOAImage || null,
    leftDisplayMedia: pbBlocks[0]?.LeftDisplayImageorVideoOne || null,
    // Extra fields kept for filtering/related lookups.
    categoryId: raw.CategoryID ?? null,
    subCategoryId: raw.SubCategoryID ?? null,
    // Resolved category / sub-category names (when the lookup maps are
    // available) so the UI can group + filter by sub-category.
    categoryName: categoryName || null,
    subcategory: subName ? String(subName).trim() : null,
    vendorId: raw.VendorID ?? null,
    storeName: raw.StoreName ?? null,
    raw,
  };
}

// ── Store fetch (memoized) ───────────────────────────────────────────────────
let storeCache = null;

// Loads the full CS Beverly Hills catalogue once and builds the category lookup
// maps. Returns { products, catMap, subMap }. Falls back to mock data on error.
async function loadStore() {
  if (storeCache) return storeCache;
  storeCache = (async () => {
    try {
      const res = await apiGet(
        `/product/getProductsByStoreName/${encodeURIComponent(STORE_NAME)}`,
      );
      const data = res?.data ?? res ?? {};
      const catMap = new Map(
        (data.categories || []).map((c) => [Number(c.CategoryID), c.CategoryName]),
      );
      const subMap = new Map(
        (data.subCategoryID || data.subCategories || []).map((s) => [Number(s.SubCategoryID), s.SubCategoryName]),
      );
      const rows = Array.isArray(data.result) ? data.result : [];
      const products = rows.map((r) => normalizeProduct(r, catMap, subMap)).filter(Boolean);
      return { products, catMap, subMap };
    } catch (err) {
      // Offline / API down — serve mock data so the UI still renders. Surface
      // the real reason so a failed live fetch isn't mistaken for real data.
      console.warn(
        `[CSBH] Live product fetch failed — showing MOCK data. ` +
        `Check that the EVOKE backend is reachable. Reason: ${err?.message || err}`,
      );
      return { products: mockProducts, catMap: new Map(), subMap: new Map() };
    }
  })();
  return storeCache;
}

// Scopes a global featured endpoint (best sellers / new collections) to this
// store. featureType is the backend value: 'bestSeller' | 'newCollections'.
async function fetchFeaturedScoped(featureType) {
  try {
    const { catMap, subMap } = await loadStore();
    const res = await apiGet(`/product/getFeaturedProducts/${featureType}`);
    const rows = res?.data?.result ?? res?.result ?? [];
    return rows
      .filter(isStoreProduct)
      .map((r) => normalizeProduct(r, catMap, subMap))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function byKeyword(products, regex) {
  return products.filter((p) => regex.test(`${p.title} ${p.description}`.toLowerCase()));
}

// ── Public API (same signatures the pages already use) ───────────────────────

// All products for the store.
export async function getStoreProducts() {
  if (isMockMode()) return mockProducts;
  const { products } = await loadStore();
  return products;
}

// Products for a section/collection slug. Always returns something usable so the
// homepage sections and collection pages stay populated.
export async function getProductsByCollection(collectionSlug) {
  if (isMockMode()) {
    switch (collectionSlug) {
      case 'mens':             return getMockMensProducts();
      case 'womens':           return getMockWomensProducts();
      case 'new-arrivals':     return getMockNewArrivals();
      case 'limited-editions': return getMockLimitedEditions();
      case 'bestsellers':      return getMockBestSellers();
      default:                 return mockProducts;
    }
  }

  const { products } = await loadStore();
  let list;
  switch (collectionSlug) {
    case 'bestsellers':
    case 'featured':
      list = await getFeaturedProducts();
      break;
    case 'new-arrivals':
      list = await getNewArrivals();
      break;
    case 'limited-editions':
      list = byKeyword(products, /limited|edition|anniversary|numbered|exclusive/);
      break;
    case 'mens-all':
      // ALL men's products — everything that isn't women's or jewelry (watches of
      // every type + cufflinks + men's accessories). Used by the top-level
      // "Men's" nav landing.
      list = products.filter((p) => p.collection !== 'womens' && p.category !== 'jewelry');
      break;
    case 'mens': {
      // Men's WATCHES only — strictly the "Men's Watches" and "Unisex Watches"
      // sub-categories. Excludes women's, smartwatches, accessories
      // (headphones/wallets), gifts/holiday bundles, jewelry and cufflinks.
      // Falls back to the inferred collection when sub-category info is missing
      // (mock mode).
      const isWatchCat = (p) =>
        p.categoryName ? /watch/i.test(p.categoryName) : p.category === 'watches';
      list = products.filter((p) => {
        const sub = (p.subcategory || '').toLowerCase();
        if (sub) {
          if (sub.includes('women')) return false;            // not women's
          return sub.includes('unisex') || sub.includes('men'); // men's or unisex
        }
        // No sub-category (e.g. mock data): fall back to inferred men's watches.
        return p.collection !== 'womens' && isWatchCat(p);
      });
      break;
    }
    case 'womens':
      // General "Women's" landing — everything for her: watches + jewelry.
      list = products.filter((p) => p.collection === 'womens' || p.category === 'jewelry');
      break;
    case 'womens-watches':
      // Women's WATCHES only (dedicated page, separate from the landing).
      list = products.filter((p) => p.collection === 'womens');
      break;
    case 'mens-cufflinks':
      list = products.filter((p) => p.category === 'cufflinks');
      break;
    case 'jewelry':
    case 'womens-jewelry':
      list = products.filter((p) => p.category === 'jewelry');
      break;
    // Named navbar collections — match the slug against the product name/desc
    // ignoring case, spaces and punctuation, so "legion-333" matches "Legion 333".
    case 'hope':
    case 'legacy':
    case 'shriners':
    case 'legion-333': {
      const needle = collectionSlug.replace(/[^a-z0-9]/gi, '').toLowerCase();
      list = products.filter((p) =>
        `${p.title} ${p.description}`.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(needle),
      );
      break;
    }
    default:
      list = products;
  }
  // Never leave a section empty — fall back to the full catalogue.
  return list && list.length ? list : products;
}

// Single product detail. Tries the rich detail endpoint (gallery + description),
// then falls back to the cached store list.
export async function getProductById(productId) {
  if (isMockMode()) return getMockProductById(productId);

  const { catMap, subMap } = await loadStore();
  try {
    const res = await apiGet(`/product/getProductById/${productId}`);
    const root = res?.data ?? res ?? {};
    const details = root.ProductDetails || root.product || null;
    if (details) {
      const photos = Array.isArray(root.PhotosAndVideos)
        ? root.PhotosAndVideos
        : Array.isArray(details.PhotosAndVideos) ? details.PhotosAndVideos : [];
      const attributes = Array.isArray(root.Attributes)
        ? root.Attributes
        : Array.isArray(details.Attributes) ? details.Attributes : [];
      // PhotosAndVideos carries BOTH product shots and lifestyle images; the
      // split (by S3 host) happens inside normalizeProduct so lifestyle shots
      // land in their own section, not the technical gallery. An explicit
      // LifestyleImages field is honoured too, if the backend ever adds one.
      const lifestyle = Array.isArray(root.LifestyleImages)
        ? root.LifestyleImages
        : Array.isArray(details.LifestyleImages) ? details.LifestyleImages : [];
      // Page-builder blocks carry the product video(s) in their media slots.
      const pageBuilder = Array.isArray(root.PageBuilderData)
        ? root.PageBuilderData
        : Array.isArray(details.PageBuilderData) ? details.PageBuilderData : [];
      const merged = {
        ...details,
        PhotosAndVideos: photos,
        LifestyleImages: lifestyle,
        PageBuilderData: pageBuilder,
      };
      return normalizeProduct(merged, catMap, subMap, attributes);
    }
  } catch {
    /* fall through to cached list */
  }

  const { products } = await loadStore();
  return products.find((p) => String(p.id) === String(productId)) || null;
}

// Fetches a product's selectable variants from the dedicated variants endpoint
// (GET /product/variants/:id). Each variant has its own price, stock, images
// and SKU. Returns [] when there are none or on error, so the detail page
// degrades gracefully (no variant section).
export async function getProductVariants(productId) {
  if (isMockMode()) return [];
  try {
    const res = await apiGet(`/product/variants/${productId}`);
    const rows = res?.data?.variants ?? res?.variants ?? res?.data ?? [];
    return (Array.isArray(rows) ? rows : [])
      .filter((v) => v && typeof v === 'object' && v.IsActive !== false && v.IsActive !== 0)
      .map((v) => {
        const vStock = v.StockQuantity != null ? Number(v.StockQuantity) : null;
        let images = [];
        if (Array.isArray(v.VariantImages)) images = v.VariantImages;
        else if (typeof v.VariantImages === 'string') {
          try { const x = JSON.parse(v.VariantImages); if (Array.isArray(x)) images = x; } catch {/* ignore */}
        }
        return {
          id: String(v.VariantID ?? v.id ?? ''),
          label: String(v.VariantName ?? v.SKU ?? '').trim(),
          price: Number(v.PriceInUSD ?? v.price ?? 0) || 0,
          stockQuantity: vStock,
          inStock: vStock == null ? true : vStock > 0,
          images: images.filter(Boolean),
          sku: v.SKU ?? null,
        };
      })
      .filter((v) => v.label);
  } catch {
    return [];
  }
}

// Detail pages route by slug, and our slug === product id.
export async function getProductBySlug(slug) {
  if (isMockMode()) return getMockProductBySlug(slug);
  return getProductById(slug);
}

// ── Curated best-seller overrides ────────────────────────────────────────────
// Front-end controlled, independent of the backend best-seller flag:
//   • PINNED   — always shown in the best-seller rail (prepended, in order).
//   • EXCLUDED — never shown as a best-seller (also filtered from the home
//     rail's top-up fillers — see Home.jsx).
export const BESTSELLER_PINNED_IDS   = [
  // Homepage "Most Loved / Bestsellers" — first 8 fill two rows of 4 in order.
  // Row 1 (top)
  '260623005',
  '241126011', // El Capitan Blue Gold
  '241204003',
  '241207007', // Oceanic
  // Row 2
  '241121001', // Cherish
  '241122001', // Faith
  '241127012', // Love
  '241206025', // Star Dweller
];
export const BESTSELLER_EXCLUDED_IDS = ['251215007']; // Christmas Luxury Bundle

export const isExcludedBestseller = (id) => BESTSELLER_EXCLUDED_IDS.includes(String(id));

// Prepend the pinned products (resolved from the full catalogue), drop excluded
// ones, and de-dupe — preserving order.
function curateBestsellers(list, allProducts) {
  const pinned = BESTSELLER_PINNED_IDS
    .map((id) => allProducts.find((p) => String(p.id) === String(id)))
    .filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const p of [...pinned, ...list]) {
    const id = String(p.id);
    if (isExcludedBestseller(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(p);
  }
  return out;
}

// Home "Bestsellers" rail. Uses the backend best-seller flag, scoped to the
// store; falls back to the store catalogue if none are flagged. The curated
// pin/exclude overrides are applied on top.
export async function getFeaturedProducts() {
  if (isMockMode()) return getFeaturedMockProducts();
  const featured = await fetchFeaturedScoped('bestSeller');
  const { products } = await loadStore();
  const base = featured.length ? featured : products;
  return curateBestsellers(base, products);
}

// New arrivals. Uses the backend new-collections flag, scoped to the store;
// falls back to the catalogue (already newest-first from the API).
export async function getNewArrivals() {
  if (isMockMode()) return getMockNewArrivals();
  const fresh = await fetchFeaturedScoped('newCollections');
  if (fresh.length) return fresh;
  const { products } = await loadStore();
  return products;
}

// Store-scoped search. Uses the backend search endpoint, then falls back to a
// client-side filter over the cached catalogue.
export async function searchProducts(query) {
  const q = String(query || '').trim();
  if (!q) return [];

  if (isMockMode()) {
    const lc = q.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(lc) ||
        p.description.toLowerCase().includes(lc) ||
        p.collection.toLowerCase().includes(lc),
    );
  }

  const { catMap, subMap, products } = await loadStore();
  try {
    const params = new URLSearchParams({ searchText: q, storeName: STORE_NAME });
    const res = await apiGet(`/product/searchCategoriesAndProducts/search?${params.toString()}`);
    const rows = res?.data?.Products ?? res?.Products ?? [];
    const list = rows.map((r) => normalizeProduct(r, catMap, subMap)).filter(Boolean);
    if (list.length) return list;
  } catch {
    /* fall through to client-side filter */
  }
  const lc = q.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(lc) ||
      p.description.toLowerCase().includes(lc),
  );
}
