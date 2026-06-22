import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import { redirectToMarketplaceWishlist } from '../../services/wishlist.js';
import { searchProducts } from '../../services/products.js';
import { logo, flagUSA } from '../../assets/index.js';

const NAV = [
  {
    label: "Men's",
    to: '/mens',
    dropdown: [
      { label: "Men's Watches",   to: '/mens' },
      { label: "Men's Cufflinks", to: '/mens-cufflinks' },
    ],
  },
  {
    label: "Women's",
    to: '/womens',
    dropdown: [
      { label: "Women's Watches", to: '/womens-watches' },
      { label: "Women's Jewelry", to: '/womens-jewelry' },
    ],
  },
  {
    label: 'Explore',
    to: '/all-products',
    dropdown: [
      { label: 'Hope Collection',                           to: '/collections/hope-collection' },
      { label: 'Legacy Collection',                         to: '/collections/legacy-collection' },
      { label: 'Shriners 100 Years Anniversary Collection', to: '/collections/shriners-100-years-anniversary-collection' },
      { label: 'LEGION 333 Collection',                     to: '/product/241206026' }, // LEGION 333 product (opens detail page directly)
    ],
  },
  {
    label: 'Contact US',
    to: '/contact',
  },
];

// ── Mobile drawer accordion sections ─────────────────────────────────────────
const DRAWER_SECTIONS = [
  {
    id: 'mens',
    label: "MEN'S",
    links: [
      { label: "MEN'S WATCHES",   to: '/mens' },
      { label: "MEN'S CUFFLINKS", to: '/mens-cufflinks' },
    ],
  },
  {
    id: 'womens',
    label: "WOMEN'S",
    links: [
      { label: "WOMEN'S WATCHES", to: '/womens-watches' },
      { label: "JEWELRY",         to: '/womens-jewelry' },
    ],
  },
  {
    id: 'explore',
    label: 'EXPLORE',
    links: [
      { label: 'ALL PIECES',                      to: '/all-products' },
      { label: 'LIMITED EDITIONS',               to: '/limited-editions' },
      { label: 'HOPE COLLECTION',                to: '/collections/hope-collection' },
      { label: 'LEGACY COLLECTION',              to: '/collections/legacy-collection' },
      { label: 'SHRINERS 100 YEARS ANNIVERSARY', to: '/collections/shriners-100-years-anniversary-collection' },
      { label: 'LEGION 333 COLLECTION',          to: '/product/241206026' }, // LEGION 333 product (opens detail page directly)
    ],
  },
];

// ── Accordion section ─────────────────────────────────────────────────────────
function AccordionSection({ section, isOpen, onToggle, onLinkClick }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6"
        style={{ paddingTop: '15px', paddingBottom: '15px' }}
      >
        <span
          className="font-sans font-bold uppercase tracking-[0.08em]"
          style={{ fontSize: '12px', color: '#ffffff', letterSpacing: '1px' }}
        >
          {section.label}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>
          {isOpen ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6h10M6 1v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={section.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-4 pt-1">
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onLinkClick}
                  className="block"
                  style={{
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    marginBottom: '14px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: '#9a9a9a',
                    fontFamily: 'inherit',
                    lineHeight: 1.3,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [openSections, setOpenSections]     = useState(['mens']);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [searching, setSearching]           = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
    else { setSearchQuery(''); setSearchResults([]); }
  }, [searchOpen]);

  // Live search-as-you-type (debounced) against the CSBH catalogue.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const id = setTimeout(() => {
      searchProducts(q)
        .then((r) => setSearchResults(r.slice(0, 6)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  function openDrawer() {
    setOpenSections([]);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleSection(id) {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  function goToProduct(slug) {
    navigate(`/product/${slug}`);
    setSearchOpen(false);
  }

  const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-cloud">
        <nav className="max-w-[1600px] mx-auto w-full px-4 lg:px-10 flex items-center h-14 lg:h-[72px] relative">

          {/* Left group — flex-1 keeps logo optically centered */}
          <div className="flex items-center flex-1">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center text-ink"
              onClick={openDrawer}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Desktop left nav */}
            <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
            {NAV.map(item => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.to === '#' ? (
                  <button className="font-sans text-[13px] text-ink hover:text-steel transition-colors py-5 flex items-center gap-1">
                    {item.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                ) : (
                  <NavLink
                    to={item.to}
                    className="font-sans text-[13px] text-ink hover:text-steel transition-colors py-5 flex items-center gap-1"
                  >
                    {item.label}
                    {item.dropdown && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </NavLink>
                )}

                {/* Desktop dropdown */}
                {item.dropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.ul
                        className="absolute top-full left-0 bg-white border border-cloud shadow-md min-w-[240px] z-50 list-none m-0 p-0"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.dropdown.map(sub => (
                          <li key={sub.to}>
                            <Link
                              to={sub.to}
                              className="block px-5 py-3.5 font-sans text-[13px] text-ink hover:bg-bone transition-colors border-b border-cloud last:border-0"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
            </ul>
          </div>{/* /Left group */}

          {/* Logo — true optical center */}
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            aria-label="CS Beverly Hills"
          >
            <img
              src={logo}
              alt="CS Beverly Hills"
              className="h-[42px] lg:h-14 w-auto object-contain max-w-[110px] lg:max-w-none"
            />
          </Link>

          {/* Right icons */}
          <div className="flex items-center justify-end flex-1 gap-1 lg:gap-2">
            {/* Search — desktop only (no room on mobile with logo + 3 icons) */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden lg:flex w-9 h-9 items-center justify-center text-ink hover:text-steel transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Wishlist — opens the shopper's wishlist on EVOKE Marketplace */}
            <button
              type="button"
              onClick={redirectToMarketplaceWishlist}
              aria-label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ''}`}
              className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center relative text-ink hover:text-steel transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {wishCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[13px] h-3 px-0.5 rounded-full bg-gold text-white text-[7px] font-bold flex items-center justify-center leading-none">
                  {wishCount}
                </span>
              )}
            </button>

            {/* Currency */}
            <button className="hidden lg:flex items-center gap-1.5 h-9 px-2 text-ink hover:text-steel transition-colors">
              <img src={flagUSA} alt="US" className="w-5 h-3.5 object-cover" />
              <span className="font-sans text-[13px]">USD</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeDrawer}
            />

            {/* Panel */}
            <motion.aside
              className="fixed top-0 left-0 z-[70] h-full flex flex-col"
              style={{
                width: '85vw',
                maxWidth: '340px',
                backgroundColor: '#181818',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Close button */}
              <div
                className="flex items-center shrink-0"
                style={{
                  padding: '18px 20px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="flex items-center justify-center"
                  style={{ width: '36px', height: '36px', marginRight: '12px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M1 1l16 16M17 1L1 17" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <img src={logo} alt="CS Beverly Hills" style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
              </div>

              {/* Scrollable menu body */}
              <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>

                {/* Accordion sections */}
                {DRAWER_SECTIONS.map(section => (
                  <AccordionSection
                    key={section.id}
                    section={section}
                    isOpen={openSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    onLinkClick={closeDrawer}
                  />
                ))}

                {/* Contact US — flat link */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                  <Link
                    to="/contact"
                    onClick={closeDrawer}
                    className="flex items-center justify-between px-6"
                    style={{ paddingTop: '15px', paddingBottom: '15px' }}
                  >
                    <span
                      className="font-sans font-bold uppercase"
                      style={{ fontSize: '12px', color: '#ffffff', letterSpacing: '1px' }}
                    >
                      CONTACT US
                    </span>
                  </Link>
                </div>

              </div>

              {/* Footer — social icons */}
              <div
                className="shrink-0 flex items-center gap-5 px-6"
                style={{
                  paddingTop: '20px',
                  paddingBottom: '24px',
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {/* Instagram */}
                <a href="#" aria-label="Instagram" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a href="#" aria-label="X" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Search overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex justify-center items-start pt-[90px] px-4 sm:px-6"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={() => setSearchOpen(false)}
          >
            <motion.div
              className="w-full max-w-[720px] bg-white rounded-lg shadow-[0_24px_60px_rgba(0,0,0,0.3)] overflow-hidden"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2.5 px-[18px] py-4 border-b border-cloud">
                <span className="text-gold shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search watches, jewelry, cufflinks…"
                  className="flex-1 bg-transparent font-sans text-[17px] text-ink placeholder:text-mist focus:outline-none focus:ring-0 border-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
                <button
                  type="button"
                  className="text-steel hover:text-ink text-[26px] leading-none shrink-0 px-1 pb-1"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  &times;
                </button>
              </form>

              {/* Live results */}
              {searchQuery.trim().length >= 2 ? (
                <div className="max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {searching && searchResults.length === 0 && (
                    <div className="flex flex-col gap-3 py-3 px-[18px]">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-center animate-pulse">
                          <div className="w-[52px] h-[52px] bg-cloud rounded" />
                          <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-[14px] bg-cloud rounded w-[60%]" />
                            <div className="h-[12px] bg-cloud rounded w-[20%]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!searching && searchResults.length === 0 && (
                    <p className="font-sans text-[14px] text-steel py-[22px] px-5 text-center">
                      No pieces match “{searchQuery.trim()}”.
                    </p>
                  )}
                  {!searching && searchResults.length > 0 && (
                    <>
                      <ul className="flex flex-col py-1.5 list-none m-0">
                        {searchResults.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => goToProduct(p.slug)}
                              className="w-full flex items-center gap-3.5 py-2.5 px-[18px] text-left hover:bg-bone transition-colors"
                            >
                              <img src={p.image} alt="" className="w-[52px] h-[52px] object-cover bg-cloud shrink-0 rounded" aria-hidden="true" />
                              <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                                <span className="block font-sans text-[14px] text-ink truncate">{p.title}</span>
                                <span className="block font-sans text-[13px] font-semibold text-gold">{usd(p.price)}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="submit"
                        className="w-full block text-left font-sans text-[13px] font-semibold tracking-[0.4px] text-ink p-[13px] border-t border-cloud bg-bone/50 hover:bg-bone transition-colors"
                      >
                        See all {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
