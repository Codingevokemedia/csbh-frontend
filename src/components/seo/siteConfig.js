// Central SEO/site configuration. Pure data (no framework imports) so it can be
// consumed from both the app and the Node build-time sitemap generator.
//
// IMPORTANT: set VITE_SITE_URL to the real production origin (no trailing slash)
// so canonical, Open Graph and sitemap URLs are correct. The default below is a
// best-guess derived from the brand's contact/social handles — confirm it.
export const SITE_NAME = 'CS Beverly Hills';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.cstimepieces.com').replace(/\/+$/, '');

export const SITE_DESCRIPTION =
  'CS Beverly Hills — Luxury Timepieces & Jewelry. Discover our exclusive collection of handcrafted watches from Beverly Hills.';

// Logo used for the default Open Graph image and Organization schema.
export const SITE_LOGO = `${SITE_URL}/ref_images/cs_bh_logo.png`;

// Brand contact + social profiles (kept in sync with the footer).
export const BRAND = {
  legalName: 'Craig Shelly Beverly Hills',
  email: 'support@craigshelly.com',
  telephone: '+1-562-472-1111',
  addressLocality: 'Beverly Hills',
  addressRegion: 'CA',
  postalCode: '90210',
  addressCountry: 'US',
  sameAs: [
    'https://www.instagram.com/craigshelly/',
    'https://www.facebook.com/CraigShellyBH/',
  ],
};

// Build an absolute URL for a given path, collapsing the homepage to the origin.
export function absoluteUrl(path = '/') {
  const p = String(path || '/');
  return p === '/' ? SITE_URL : `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`;
}
