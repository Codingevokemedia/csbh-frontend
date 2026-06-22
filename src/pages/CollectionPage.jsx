import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductFilters from '../components/filters/ProductFilters.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { applyProductFilters } from '../utils/filterProducts.js';
import { getCollectionBySlug } from '../data/collections.js';
import { getProductsByCollection, searchProducts } from '../services/products.js';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title',      label: 'Name A–Z' },
];

const DEFAULT_FILTERS = {
  availability: [],
  priceRange:   [0, 99999],
  productTypes: [],
  subcategories: [],
};

// How many products to show per page in a collection listing.
const PAGE_SIZE = 12;

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

// ── Editorial heading (used when there is no banner image) ────────────────────
function CollectionHero({ name, eyebrow, description, productCount, loading }) {
  return (
    <motion.div
      className="px-6 sm:px-10 lg:px-16 pt-12 pb-10 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col gap-3 max-w-2xl">
        {eyebrow && (
          <motion.span
            variants={itemVariants}
            className="font-sans text-[10px] tracking-[0.35em] uppercase font-semibold"
            style={{ color: '#C9A84C' }}
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.h1
          variants={itemVariants}
          className="font-display font-light leading-[1] uppercase"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            letterSpacing: '0.08em',
            color: '#151515',
          }}
        >
          {name}
        </motion.h1>

        {/* Gold accent line */}
        <motion.div
          variants={itemVariants}
          className="h-[1.5px] rounded-full"
          style={{ width: '48px', backgroundColor: '#C9A84C', marginTop: '2px' }}
        />

        {description && (
          <motion.p
            variants={itemVariants}
            className="font-sans text-[13px] text-steel leading-relaxed"
            style={{ maxWidth: '520px', marginTop: '4px' }}
          >
            {description}
          </motion.p>
        )}

        {!loading && typeof productCount === 'number' && (
          <motion.p
            variants={itemVariants}
            className="font-sans text-[11px] text-mist"
            style={{ marginTop: '2px' }}
          >
            {productCount} {productCount === 1 ? 'piece' : 'pieces'}
          </motion.p>
        )}
      </div>

      {/* Section divider */}
      <motion.div
        variants={itemVariants}
        className="mt-10 border-t border-cloud"
      />
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ collectionName }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 gap-5 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="19" stroke="#C9A84C" strokeOpacity="0.3" strokeWidth="1"/>
        <circle cx="20" cy="20" r="13" stroke="#C9A84C" strokeOpacity="0.15" strokeWidth="1"/>
        <path d="M20 14v6l4 2" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div className="flex flex-col gap-2">
        <p className="font-display text-2xl text-ink font-light">
          {collectionName ? `No pieces in ${collectionName}` : 'No products found'}
        </p>
        <p className="font-sans text-sm text-steel">
          New arrivals are on the way. Check back soon.
        </p>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CollectionPage({ collection, title, subtitle, banner, itemNoun = 'timepiece' }) {
  // Support both props-driven (MensWatches etc.) and route-driven (/collections/:slug)
  const { collectionSlug } = useParams();
  const collectionData = collectionSlug ? getCollectionBySlug(collectionSlug) : null;

  const effectiveCollection = collection || collectionData?.collectionKey || collectionSlug || '';
  const effectiveTitle      = title  || collectionData?.name        || (collectionSlug ? collectionSlug.replace(/-/g, ' ') : '');
  const effectiveEyebrow    = collectionData?.eyebrow   || null;
  const effectiveDescription = subtitle || collectionData?.description || null;
  const hasBanner = !!banner;

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [page, setPage]         = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const sort  = searchParams.get('sort') || 'newest';
  const query = searchParams.get('q')    || '';

  const minPrice = useMemo(
    () => (products.length ? Math.floor(Math.min(...products.map(p => Number(p.price) || 0))) : 0),
    [products],
  );
  const maxPrice = useMemo(
    () => (products.length ? Math.ceil(Math.max(...products.map(p => Number(p.price) || 0))) : 99999),
    [products],
  );

  // Reset price bounds when a new collection loads
  useEffect(() => {
    if (products.length) {
      setFilters(f => ({ ...f, priceRange: [minPrice, maxPrice] }));
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFilters(DEFAULT_FILTERS);
    const fetch = query
      ? searchProducts(query)
      : getProductsByCollection(effectiveCollection);
    fetch
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [effectiveCollection, query]);

  function clearFilters() {
    setFilters({ availability: [], priceRange: [minPrice, maxPrice], productTypes: [], subcategories: [] });
  }

  const displayed = useMemo(() => {
    const filtered = applyProductFilters(products, filters);
    switch (sort) {
      case 'price-asc':  return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...filtered].sort((a, b) => b.price - a.price);
      case 'title':      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      default:           return filtered;
    }
  }, [products, filters, sort]);

  // Pagination: derive total pages + the current page's slice from `displayed`.
  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  // Clamp so a filter/sort change that shrinks the list never strands us on an
  // out-of-range page.
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => displayed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [displayed, safePage],
  );

  // Reset to the first page whenever the result set changes (collection,
  // search, sort, or filters).
  useEffect(() => {
    setPage(1);
  }, [effectiveCollection, query, sort, filters]);

  function handlePageChange(next) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setSort(v) {
    const next = new URLSearchParams(searchParams);
    next.set('sort', v);
    setSearchParams(next);
  }

  const activeFilterCount =
    filters.availability.length +
    filters.productTypes.length +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  const filterProps = {
    products,
    filters,
    setFilters,
    minPrice,
    maxPrice,
    onClearFilters: clearFilters,
  };

  return (
    <div>
      {/* ── Banner (photo pages: MensWatches, WomensWatches, etc.) ── */}
      {hasBanner ? (
        <div className="relative h-60 sm:h-72 overflow-hidden">
          <img
            src={banner}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 text-center px-6">
            <motion.h1
              className="font-display text-5xl sm:text-6xl text-white font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              {effectiveTitle}
            </motion.h1>
            {effectiveDescription && (
              <motion.p
                className="font-sans text-sm text-white/70 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.15 }}
              >
                {effectiveDescription}
              </motion.p>
            )}
          </div>
        </div>
      ) : collectionSlug ? (
        /* ── Editorial heading (named collections from navbar) ── */
        <CollectionHero
          name={effectiveTitle}
          eyebrow={effectiveEyebrow}
          description={effectiveDescription}
          productCount={displayed.length}
          loading={loading}
        />
      ) : (
        /* ── Plain text heading (pages without banner prop) ── */
        <div className="pt-16 pb-6 px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
          <SectionHeader title={effectiveTitle} subtitle={effectiveDescription} align="left" />
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full py-8">

        {/* Mobile filter + clear row */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <ProductFilters {...filterProps} />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="font-sans text-[11px] text-steel underline underline-offset-2 hover:text-ink transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex gap-12">
          {/* Desktop sidebar — pinned below the sticky navbar (72px) so it stays
              in view while the product grid scrolls. self-start stops the flex
              row from stretching it (which would break position: sticky), and
              the max-height lets long filter lists scroll on their own. */}
          <div className="no-scrollbar hidden lg:block lg:sticky lg:top-[88px] self-start max-h-[calc(100vh-104px)] overflow-y-auto pr-1">
            <ProductFilters {...filterProps} />
          </div>

          {/* Product area */}
          <div className="flex-1 min-w-0">
            {/* Sort + count bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-cloud">
              <p className="font-sans text-[11px] text-steel">
                {loading
                  ? 'Loading…'
                  : `${displayed.length} ${itemNoun}${displayed.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort-select"
                  className="font-sans text-[10px] tracking-widest uppercase text-steel"
                >
                  Sort
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="bg-white border border-cloud text-ink font-sans text-xs px-3 py-2 focus:outline-none focus:border-gold cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid or empty state */}
            {!loading && products.length === 0 ? (
              <EmptyState collectionName={effectiveTitle} />
            ) : (
              <>
                <ProductGrid
                  products={pageItems}
                  loading={loading}
                  error={error}
                  onRetry={() => {
                    setLoading(true);
                    getProductsByCollection(effectiveCollection)
                      .then(setProducts)
                      .finally(() => setLoading(false));
                  }}
                  columns={3}
                />
                {!loading && !error && (
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
