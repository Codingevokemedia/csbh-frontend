import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO, absoluteUrl } from './siteConfig.js';

const DEFAULT_TITLE = `${SITE_NAME} | Luxury Timepieces`;

/**
 * Per-page SEO tags. React 19 hoists <title>/<meta>/<link> rendered anywhere in
 * the component tree into <head>, so this works without any helmet dependency —
 * render <Seo … /> once per page. It emits NO visible markup, so it can never
 * affect layout, styling or behaviour.
 *
 * Props:
 *  - title          page title (SITE_NAME is appended automatically)
 *  - description    meta description (falls back to the site default)
 *  - image          absolute Open Graph image URL
 *  - type           Open Graph type ('website' | 'product' | 'article')
 *  - canonicalPath  path for the canonical URL. Defaults to the current path
 *                   WITHOUT the query string, so filter/sort/search parameter
 *                   URLs (e.g. /all-products?sort=price-asc) canonicalise to the
 *                   clean page. Pass an explicit value to collapse duplicate
 *                   routes onto a single canonical (e.g. /our-partners-
 *                   testimonials → /testimonials).
 *  - noindex        emit robots noindex,nofollow (admin / auth / utility pages)
 *  - jsonLd         one JSON-LD object or an array of them
 */
export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  image = SITE_LOGO,
  type = 'website',
  canonicalPath,
  noindex = false,
  jsonLd,
}) {
  const { pathname } = useLocation();
  const canonical = absoluteUrl(canonicalPath ?? pathname);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const blocks = (jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []).filter(Boolean);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {blocks.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
