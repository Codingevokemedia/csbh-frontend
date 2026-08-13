// JSON-LD structured-data builders. Each returns a plain object that <Seo>
// serialises into a <script type="application/ld+json"> tag. Structured data is
// additive metadata for search engines — it has no effect on the rendered UI.
import { SITE_NAME, SITE_URL, SITE_LOGO, BRAND, absoluteUrl } from './siteConfig.js';

// Organization — identifies the brand to search engines (knowledge panel, logo).
export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: SITE_LOGO,
    email: BRAND.email,
    telephone: BRAND.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.addressLocality,
      addressRegion: BRAND.addressRegion,
      postalCode: BRAND.postalCode,
      addressCountry: BRAND.addressCountry,
    },
    sameAs: BRAND.sameAs,
  };
}

// WebSite — enables the sitelinks search box and names the site.
export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/all-products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Product — rich result for a product detail page (price, availability, brand).
export function buildProduct(product, { path } = {}) {
  if (!product) return null;
  const availability =
    product.inStock === false
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';
  const images = (product.gallery && product.gallery.length ? product.gallery : [product.image])
    .filter(Boolean);
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: images,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: Number(product.price) || 0,
      priceCurrency: 'USD',
      availability,
      url: absoluteUrl(path || `/product/${product.slug}`),
    },
  };
  return node;
}

// BreadcrumbList — shows the page's position in the site hierarchy in results.
export function buildBreadcrumb(items = []) {
  const filtered = items.filter((i) => i && i.name && i.path);
  if (!filtered.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: filtered.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
