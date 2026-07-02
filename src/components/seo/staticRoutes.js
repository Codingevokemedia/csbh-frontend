// SEO metadata for every static (non-data-driven) route. Shared by the in-app
// <RouteSeo> resolver and the build-time sitemap generator, so the two never
// drift. Pure data — no imports — so Node can require it at build time.
//
// Data-driven routes (product detail, collection listing) are NOT listed here;
// those pages render their own <Seo> with dynamic titles/descriptions.

// Indexable static pages. `priority` feeds the sitemap (homepage 1.0, rest 0.8).
export const STATIC_ROUTES = [
  { path: '/',                          title: null,                         description: 'CS Beverly Hills — Luxury Swiss-made timepieces and handcrafted jewelry from Beverly Hills. Explore watches, cufflinks and fine jewelry.', priority: 1.0 },
  { path: '/mens-all',                  title: "Men's Collection",           description: "Explore the full CS Beverly Hills men's collection — luxury watches, cufflinks and accessories.", priority: 0.8 },
  { path: '/mens',                      title: "Men's Watches",              description: "Precision-engineered luxury men's watches from CS Beverly Hills.", priority: 0.8 },
  { path: '/mens-cufflinks',            title: "Men's Cufflinks",            description: "Handcrafted luxury cufflinks from CS Beverly Hills.", priority: 0.8 },
  { path: '/womens',                    title: "Women's Collection",         description: "Discover CS Beverly Hills women's watches and fine jewelry.", priority: 0.8 },
  { path: '/womens-watches',            title: "Women's Watches",            description: "Elegant luxury women's watches from CS Beverly Hills.", priority: 0.8 },
  { path: '/womens-jewelry',            title: "Women's Jewelry",            description: "Handcrafted fine jewelry from CS Beverly Hills.", priority: 0.8 },
  { path: '/new-arrivals',              title: 'New Arrivals',               description: "The latest luxury timepieces and jewelry from CS Beverly Hills.", priority: 0.8 },
  { path: '/bestsellers',               title: 'Bestsellers',                description: "The most-loved CS Beverly Hills timepieces and jewelry.", priority: 0.8 },
  { path: '/limited-editions',          title: 'Limited Editions',           description: "Exclusive limited-edition timepieces from CS Beverly Hills.", priority: 0.8 },
  { path: '/all-products',              title: 'All Products',               description: "Browse the complete CS Beverly Hills collection of timepieces, cufflinks and jewelry.", priority: 0.8 },
  { path: '/about',                     title: 'About Us',                   description: "The story of CS Beverly Hills — Swiss-made timepieces and handmade jewelry from Los Angeles.", priority: 0.8 },
  { path: '/contact',                   title: 'Contact Us',                 description: "Get in touch with CS Beverly Hills.", priority: 0.8 },
  { path: '/testimonials',              title: 'Partner Testimonials',       description: "What our partners and clients say about CS Beverly Hills.", priority: 0.8 },
  { path: '/privacy-policy',            title: 'Privacy Policy',             description: "CS Beverly Hills privacy policy.", priority: 0.8 },
  { path: '/terms',                     title: 'Terms & Conditions',         description: "CS Beverly Hills terms and conditions.", priority: 0.8 },
  { path: '/register-product',          title: 'Register Your Watch',        description: "Register your CS Beverly Hills timepiece.", priority: 0.8 },
  { path: '/ambassador-program',        title: 'Ambassador Program',         description: "Join the CS Beverly Hills ambassador program.", priority: 0.8 },
  { path: '/corporate-partner-program', title: 'Corporate Partner Program',  description: "Partner with CS Beverly Hills.", priority: 0.8 },
  { path: '/news',                      title: 'News',                       description: "Latest news from CS Beverly Hills.", priority: 0.8 },
  { path: '/press-release',             title: 'Press Release',              description: "CS Beverly Hills press releases.", priority: 0.8 },
  { path: '/peace-of-mind',             title: 'Peace of Mind',              description: "The CS Beverly Hills promise — authenticity, warranty and care.", priority: 0.8 },
  { path: '/ai-content-disclosure',     title: 'AI Content Disclosure',      description: "CS Beverly Hills AI content disclosure.", priority: 0.8 },
];

// Routes that must never be indexed (utility/auth/admin). Emitted with a
// noindex,nofollow robots tag and excluded from the sitemap.
export const NOINDEX_ROUTES = [
  { path: '/cart-bridge',             title: 'Cart' },
  { path: '/auth',                    title: 'Sign In' },
  { path: '/admin/login',             title: 'Admin Sign In' },
  { path: '/admin/homepage-products', title: 'Admin' },
];

// Duplicate/alias routes → the canonical path they should point at, so search
// engines index only one URL for the same content.
export const CANONICAL_ALIASES = {
  '/our-partners-testimonials': '/testimonials',
};

// Path prefixes handled by data-driven pages (they render their own <Seo>), so
// the RouteSeo resolver leaves them alone.
export const DYNAMIC_PREFIXES = ['/product/', '/collection/', '/collections/'];
