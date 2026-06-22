// Normalise availability across different API/mock shapes
function isInStock(product) {
  if (typeof product.inStock === 'boolean') return product.inStock;
  if (typeof product.available === 'boolean') return product.available;
  if (typeof product.stock === 'number') return product.stock > 0;
  if (typeof product.quantity === 'number') return product.quantity > 0;
  return true; // assume in-stock if field is absent
}

// Derive a display label + stable key from whatever type field is present
const COLLECTION_MAP = {
  mens:              "Men's Watches",
  womens:            "Women's Watches",
  'new-arrivals':    'New Arrivals',
  'limited-editions': 'Limited Edition',
  limited:           'Limited Edition',
  jewelry:           'Jewelry',
  watches:           'Watches',
  cufflinks:         'Cufflinks',
};

export function deriveProductType(product) {
  const raw =
    product.productType ||
    product.type ||
    product.category ||
    product.collection ||
    'other';
  return {
    key:   raw,
    label: COLLECTION_MAP[raw] || raw.charAt(0).toUpperCase() + raw.slice(1).replace(/-/g, ' '),
  };
}

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Returns { inStock: N, outOfStock: N } counts from the full products array.
 */
export function getAvailabilityCounts(products) {
  return products.reduce(
    (acc, p) => {
      isInStock(p) ? acc.inStock++ : acc.outOfStock++;
      return acc;
    },
    { inStock: 0, outOfStock: 0 },
  );
}

/**
 * Returns [{ key, label, count }] sorted by count desc.
 */
export function getProductTypeCounts(products) {
  const map = {};
  products.forEach(p => {
    const { key, label } = deriveProductType(p);
    if (!map[key]) map[key] = { key, label, count: 0 };
    map[key].count++;
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

/**
 * Returns [{ key, label, count }] of sub-categories present in the products,
 * sorted by count desc. The sub-category NAME is used as both key and label.
 */
export function getSubcategoryCounts(products) {
  const map = {};
  products.forEach(p => {
    const name = (p.subcategory || '').trim();
    if (!name) return;
    if (!map[name]) map[name] = { key: name, label: name, count: 0 };
    map[name].count++;
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

/**
 * Applies the filter state to a products array.
 * filters = { availability: [], priceRange: [min, max], productTypes: [], subcategories: [] }
 */
export function applyProductFilters(products, filters) {
  const {
    availability = [],
    priceRange = [0, Infinity],
    productTypes = [],
    subcategories = [],
  } = filters;
  const [priceMin, priceMax] = priceRange;

  return products.filter(p => {
    // Availability
    if (availability.length > 0) {
      const inStock = isInStock(p);
      const wantsIn  = availability.includes('inStock');
      const wantsOut = availability.includes('outOfStock');
      if (wantsIn && !wantsOut  && !inStock) return false;
      if (wantsOut && !wantsIn  &&  inStock) return false;
    }

    // Price
    const price = Number(p.price) || 0;
    if (price < priceMin || price > priceMax) return false;

    // Product type
    if (productTypes.length > 0) {
      const { key } = deriveProductType(p);
      if (!productTypes.includes(key)) return false;
    }

    // Sub-category
    if (subcategories.length > 0) {
      const name = (p.subcategory || '').trim();
      if (!subcategories.includes(name)) return false;
    }

    return true;
  });
}
