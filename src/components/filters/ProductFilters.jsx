import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailabilityCounts, getProductTypeCounts, getSubcategoryCounts } from '../../utils/filterProducts.js';

// ── Dual range slider ─────────────────────────────────────────────────────────
function PriceRangeSlider({ min, max, low, high, onLowChange, onHighChange }) {
  const range = max - min || 1;
  const lowPct  = ((low  - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  const shared = [
    'absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none',
    '[&::-webkit-slider-thumb]:pointer-events-auto',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:w-[14px]',
    '[&::-webkit-slider-thumb]:h-[14px]',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-[#111]',
    '[&::-webkit-slider-thumb]:border-0',
    '[&::-webkit-slider-thumb]:cursor-pointer',
    '[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_#fff]',
    '[&::-moz-range-thumb]:pointer-events-auto',
    '[&::-moz-range-thumb]:appearance-none',
    '[&::-moz-range-thumb]:w-[14px]',
    '[&::-moz-range-thumb]:h-[14px]',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-[#111]',
    '[&::-moz-range-thumb]:border-0',
    '[&::-moz-range-thumb]:cursor-pointer',
    '[&::-webkit-slider-runnable-track]:bg-transparent',
    '[&::-moz-range-track]:bg-transparent',
  ].join(' ');

  return (
    <div className="flex flex-col gap-5">
      {/* Track */}
      <div className="relative h-[14px] flex items-center select-none">
        <div className="absolute w-full h-[1px] bg-[#ddd]" />
        <div
          className="absolute h-[1px] bg-[#111]"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range" min={min} max={max} value={low}
          onChange={e => { const v = Number(e.target.value); if (v <= high) onLowChange(v); }}
          className={`${shared} z-[2]`}
        />
        <input
          type="range" min={min} max={max} value={high}
          onChange={e => { const v = Number(e.target.value); if (v >= low) onHighChange(v); }}
          className={`${shared} z-[3]`}
        />
      </div>

      {/* Inputs */}
      <div className="flex items-center gap-3">
        <PriceInput value={low}  min={min} max={high} onChange={v => { if (v <= high) onLowChange(v); }} />
        <span className="text-[#aaa] font-sans text-[15px] shrink-0">-</span>
        <PriceInput value={high} min={low}  max={max}  onChange={v => { if (v >= low)  onHighChange(v); }} />
      </div>
    </div>
  );
}

function PriceInput({ value, min, max, onChange }) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => { setLocal(String(value)); }, [value]);

  function commit() {
    const n = Number(local);
    if (!isNaN(n) && n >= min && n <= max) onChange(n);
    else setLocal(String(value));
  }

  return (
    <div
      className="flex items-center gap-1.5 flex-1"
      style={{ height: '48px', border: '1px solid #ddd', padding: '0 14px' }}
    >
      <span style={{ fontSize: '18px', color: '#aaa', fontFamily: 'inherit', lineHeight: 1 }}>$</span>
      <input
        type="number"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && commit()}
        style={{ fontSize: '18px', color: '#777', width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit' }}
      />
    </div>
  );
}

// ── Filter section wrapper ────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '42px' }}>
      <p style={{
        fontSize: '14px',
        fontWeight: 700,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: '#202020',
        marginBottom: '22px',
        fontFamily: 'inherit',
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Filter option row ─────────────────────────────────────────────────────────
function FilterOption({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        fontSize: '17px',
        color: active ? '#111111' : '#6f6f6f',
        fontWeight: active ? 500 : 400,
        marginBottom: '18px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ── Inner filter panel (shared by sidebar + drawer) ───────────────────────────
function FilterPanel({ products, filters, setFilters, minPrice, maxPrice, onClearFilters }) {
  const availCounts = getAvailabilityCounts(products);
  const typeCounts  = getProductTypeCounts(products);
  const subCounts   = getSubcategoryCounts(products);

  const { availability, priceRange, productTypes, subcategories = [] } = filters;
  const [priceLow,  setPriceLow]  = useState(priceRange[0]);
  const [priceHigh, setPriceHigh] = useState(priceRange[1]);

  // Sync when external minPrice/maxPrice changes (e.g. new collection loads)
  useEffect(() => {
    setPriceLow(priceRange[0]);
    setPriceHigh(priceRange[1]);
  }, [priceRange[0], priceRange[1]]);

  function toggleAvailability(key) {
    setFilters(f => ({
      ...f,
      availability: f.availability.includes(key)
        ? f.availability.filter(k => k !== key)
        : [...f.availability, key],
    }));
  }

  function toggleType(key) {
    setFilters(f => ({
      ...f,
      productTypes: f.productTypes.includes(key)
        ? f.productTypes.filter(k => k !== key)
        : [...f.productTypes, key],
    }));
  }

  function toggleSubcategory(key) {
    setFilters(f => {
      const current = f.subcategories || [];
      return {
        ...f,
        subcategories: current.includes(key)
          ? current.filter(k => k !== key)
          : [...current, key],
      };
    });
  }

  const commitPrice = useCallback((low, high) => {
    setFilters(f => ({ ...f, priceRange: [low, high] }));
  }, [setFilters]);

  function handleLowChange(v) {
    setPriceLow(v);
    commitPrice(v, priceHigh);
  }
  function handleHighChange(v) {
    setPriceHigh(v);
    commitPrice(priceLow, v);
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* AVAILABILITY */}
      <Section title="Availability">
        {availCounts.inStock > 0 && (
          <FilterOption
            label={`In stock (${availCounts.inStock})`}
            active={availability.includes('inStock')}
            onClick={() => toggleAvailability('inStock')}
          />
        )}
        {availCounts.outOfStock > 0 && (
          <FilterOption
            label={`Out of stock (${availCounts.outOfStock})`}
            active={availability.includes('outOfStock')}
            onClick={() => toggleAvailability('outOfStock')}
          />
        )}
      </Section>

      {/* PRICE */}
      <Section title="Price">
        <PriceRangeSlider
          min={minPrice}
          max={maxPrice}
          low={priceLow}
          high={priceHigh}
          onLowChange={handleLowChange}
          onHighChange={handleHighChange}
        />
      </Section>

      {/* PRODUCT TYPE */}
      {typeCounts.length > 0 && (
        <Section title="Product Type">
          {typeCounts.map(({ key, label, count }) => (
            <FilterOption
              key={key}
              label={`${label} (${count})`}
              active={productTypes.includes(key)}
              onClick={() => toggleType(key)}
            />
          ))}
        </Section>
      )}

      {/* SUBCATEGORY */}
      {subCounts.length > 0 && (
        <Section title="Subcategory">
          {subCounts.map(({ key, label, count }) => (
            <FilterOption
              key={key}
              label={`${label} (${count})`}
              active={subcategories.includes(key)}
              onClick={() => toggleSubcategory(key)}
            />
          ))}
        </Section>
      )}

      {/* Clear */}
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          style={{
            fontSize: '13px',
            color: '#aaa',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export default function ProductFilters({
  products,
  filters,
  setFilters,
  minPrice,
  maxPrice,
  onClearFilters,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCount =
    filters.availability.length +
    filters.productTypes.length +
    (filters.subcategories?.length || 0) +
    (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const panelProps = { products, filters, setFilters, minPrice, maxPrice, onClearFilters };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:block" style={{ width: '260px', flexShrink: 0, paddingTop: '4px' }}>
        <FilterPanel {...panelProps} />
      </aside>

      {/* ── Mobile: filter button ────────────────────────────────────── */}
      <div className="lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 border border-[#202020] text-[#202020] bg-white active:scale-[0.97] transition-all duration-200"
          style={{ padding: '10px 18px', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}
        >
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
            <path d="M1 1h12M3 6h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              className="fixed top-0 left-0 z-[70] h-full bg-white flex flex-col overflow-hidden"
              style={{ width: '300px', maxWidth: '85vw' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between shrink-0"
                style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#202020' }}>
                  Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="text-[#666] hover:text-[#111] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto" style={{ padding: '28px 24px' }}>
                <FilterPanel {...panelProps} onClearFilters={null} />
              </div>

              {/* Footer actions */}
              <div
                className="shrink-0 flex gap-3"
                style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}
              >
                <button
                  onClick={() => { onClearFilters?.(); }}
                  className="flex-1 border border-[#ddd] text-[#666] bg-white transition-colors hover:border-[#999] hover:text-[#111]"
                  style={{ height: '48px', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 bg-[#111] text-white transition-colors hover:bg-[#333]"
                  style={{ height: '48px', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
