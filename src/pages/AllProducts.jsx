import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductFilters from '../components/filters/ProductFilters.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { applyProductFilters } from '../utils/filterProducts.js';
import { getStoreProducts, searchProducts } from '../services/products.js';

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

const PAGE_SIZE = 12;

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

function ExploreHero({ productCount, loading, query }) {
  return (
    <motion.div
      className="px-6 sm:px-10 lg:px-16 pt-16 pb-10 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col gap-3 max-w-2xl">
        <motion.span
          variants={itemVariants}
          className="font-sans text-[10px] tracking-[0.35em] uppercase font-semibold text-gold"
        >
          {query ? 'Search Results' : 'Catalogue'}
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="font-display font-light leading-[1] uppercase text-ink"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '0.08em' }}
        >
          {query ? `Results for “${query}”` : 'Explore All Pieces'}
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="h-[1.5px] w-12 bg-gold mt-2 rounded-full"
        />

        <motion.p
          variants={itemVariants}
          className="font-sans text-[13px] text-steel leading-relaxed max-w-md mt-4"
        >
          Discover the complete CS Beverly Hills collection. From precision-engineered timepieces to artisanal cufflinks and fine jewelry, explore the intersection of tradition and modern luxury.
        </motion.p>

        {!loading && typeof productCount === 'number' && (
          <motion.p
            variants={itemVariants}
            className="font-sans text-[11px] text-mist mt-2"
          >
            Showing {productCount} total {productCount === 1 ? 'piece' : 'pieces'}
          </motion.p>
        )}
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-12 border-t border-cloud"
      />
    </motion.div>
  );
}

export default function AllProducts() {
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

  useEffect(() => {
    if (products.length) {
      setFilters(f => ({ ...f, priceRange: [minPrice, maxPrice] }));
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFilters(DEFAULT_FILTERS);
    // When a ?q= search term is present, show matching items; otherwise the
    // full catalogue.
    const load = query ? searchProducts(query) : getStoreProducts();
    load
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

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

  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => displayed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [displayed, safePage],
  );

  useEffect(() => {
    setPage(1);
  }, [sort, filters]);

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
    (filters.subcategories?.length || 0) +
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
    <div className="bg-cream min-h-screen">
      <ExploreHero productCount={displayed.length} loading={loading} query={query} />

      <div className="px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full py-8">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <ProductFilters {...filterProps} />
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="font-sans text-[11px] text-steel underline underline-offset-2">
              Clear all
            </button>
          )}
        </div>

        <div className="flex gap-12">
          <div className="hidden lg:block lg:sticky lg:top-[88px] self-start max-h-[calc(100vh-104px)] overflow-y-auto pr-1 scrollbar-hide">
            <ProductFilters {...filterProps} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-cloud">
              <p className="font-sans text-[11px] text-steel">
                {loading ? 'Loading catalogue…' : `${displayed.length} piece${displayed.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="font-sans text-[10px] tracking-widest uppercase text-steel">Sort</label>
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

            {/* Grid */}
            <ProductGrid
              products={pageItems}
              loading={loading}
              error={error}
              columns={3}
            />

            {!loading && !error && displayed.length > 0 && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            )}

            {!loading && !error && displayed.length === 0 && (
              <div className="py-24 text-center">
                <p className="font-display text-2xl text-ink font-light">No pieces match your filters</p>
                <button onClick={clearFilters} className="mt-4 font-sans text-[11px] text-gold uppercase tracking-widest font-semibold">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
