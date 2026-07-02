// Build-time sitemap.xml + robots.txt generator.
//
// Runs automatically before every build (npm "prebuild" hook) and can be run
// manually with `npm run sitemap`. It fetches the live CS Beverly Hills
// catalogue and writes the full set of indexable URLs to public/sitemap.xml, so
// the sitemap regenerates on every deploy — new products, categories and
// collections are picked up without manual edits.
//
// The API is best-effort: if the backend is unreachable at build time the script
// still writes the static routes + robots.txt and exits 0, so a build never
// fails because of the sitemap.
//
// Override behaviour with env vars (also read from a local .env):
//   VITE_SITE_URL         production origin (e.g. https://www.craigshelly.com)
//   VITE_EVOKE_API_BASE   catalogue API base (e.g. https://api.example.com/api)
//   VITE_CSBH_STORE_NAME  store name to fetch (default "CS Beverly Hills")
//   VITE_EVOKE_API_KEY    optional x-api-key header

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { STATIC_ROUTES } from '../src/components/seo/staticRoutes.js';
import { COLLECTIONS } from '../src/data/collections.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');

// ── Env (process.env, with a light .env fallback so local runs work) ──────────
function loadEnv() {
  const env = { ...process.env };
  const envPath = resolve(ROOT, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}
const env = loadEnv();

const SITE_URL = (env.VITE_SITE_URL || 'https://www.cstimepieces.com').replace(/\/+$/, '');
const API_BASE = (env.VITE_EVOKE_API_BASE || '').replace(/\/+$/, '');
const STORE_NAME = env.VITE_CSBH_STORE_NAME || 'CS Beverly Hills';
const API_KEY = env.VITE_EVOKE_API_KEY || '';
const TODAY = new Date().toISOString().slice(0, 10);

// Slug builder — mirrors slugify() in src/services/products.js so sitemap URLs
// match the ones the app links to.
function slugify(str) {
  return String(str || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchProductSlugs() {
  if (!API_BASE) {
    console.warn('[sitemap] VITE_EVOKE_API_BASE not set — skipping product URLs.');
    return [];
  }
  try {
    const url = `${API_BASE}/product/getProductsByStoreName/${encodeURIComponent(STORE_NAME)}`;
    const res = await fetch(url, {
      headers: API_KEY ? { 'x-api-key': API_KEY } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = json?.data?.result ?? json?.result ?? [];
    const slugs = new Set();
    for (const r of rows) {
      const name = r?.ProductName ?? r?.title ?? r?.name;
      const id = r?.ProductID ?? r?.id;
      const slug = slugify(name) || (id != null ? String(id) : '');
      if (slug) slugs.add(slug);
    }
    return [...slugs];
  } catch (err) {
    console.warn(`[sitemap] Product fetch failed (${err.message}) — writing static routes only.`);
    return [];
  }
}

function urlEntry({ path, priority = 0.8, changefreq = 'weekly', lastmod = TODAY }) {
  const loc = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority.toFixed(1)}</priority>\n` +
    `  </url>`
  );
}

async function main() {
  const entries = [];

  // Static indexable pages (homepage 1.0, everything else 0.8).
  for (const r of STATIC_ROUTES) {
    entries.push(
      urlEntry({
        path: r.path,
        priority: r.priority ?? 0.8,
        changefreq: r.path === '/' ? 'daily' : 'weekly',
      }),
    );
  }

  // Named marketing collections (/collection/:slug).
  for (const c of COLLECTIONS) {
    entries.push(urlEntry({ path: `/collection/${c.slug}`, priority: 0.8 }));
  }

  // Product detail pages (fetched live).
  const productSlugs = await fetchProductSlugs();
  for (const slug of productSlugs) {
    entries.push(urlEntry({ path: `/product/${slug}`, priority: 0.8 }));
  }

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries.join('\n')}\n` +
    `</urlset>\n`;

  const robots =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /admin/\n` +
    `Disallow: /auth\n` +
    `Disallow: /cart-bridge\n` +
    `\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`;

  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(resolve(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');

  console.log(
    `[sitemap] Wrote ${entries.length} URLs ` +
    `(${STATIC_ROUTES.length} static, ${COLLECTIONS.length} collections, ${productSlugs.length} products) ` +
    `→ public/sitemap.xml and public/robots.txt`,
  );
}

main().catch((err) => {
  console.error('[sitemap] Unexpected error:', err);
  // Never fail the build because of the sitemap.
  process.exit(0);
});
