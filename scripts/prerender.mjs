// Post-build static prerender (SSG for the SPA).
//
// Runs after `vite build` (npm "postbuild" hook). It boots a static server over
// dist/, drives a headless Chrome over every URL in dist/sitemap.xml, and writes
// the fully-rendered HTML back as dist/<route>/index.html. Crawlers and social
// scrapers then receive real content + meta tags on the first byte, while the
// SPA still boots and takes over in the browser exactly as before (the app code
// is untouched — this only snapshots the output).
//
// Uses puppeteer-core with the system Chrome/Edge, so there is no large Chromium
// download. It is intentionally NON-FATAL: if no browser is found (e.g. a CI box
// without Chrome) it logs a warning and exits 0, leaving the client-rendered
// meta tags as the fallback — the build never fails because of prerendering.
//
// Env:
//   PUPPETEER_EXECUTABLE_PATH  explicit Chrome/Edge path (overrides detection)
//   PRERENDER_MAX              cap the number of routes (debug/CI speed)
//   PRERENDER_CONCURRENCY      parallel pages (default 4)

import http from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

// Locate a usable Chrome/Edge without downloading one.
function findBrowser() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) || null;
}

// Read the routes to prerender from the generated sitemap (single source of
// truth with the sitemap generator). Always includes '/'.
async function readRoutes() {
  const sitemapPath = resolve(DIST, 'sitemap.xml');
  if (!existsSync(sitemapPath)) return ['/'];
  const xml = await readFile(sitemapPath, 'utf8');
  const routes = new Set(['/']);
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      routes.add(new URL(m[1]).pathname || '/');
    } catch {
      /* ignore malformed loc */
    }
  }
  return [...routes];
}

// Static file server for dist/. Extensionless paths always get the ORIGINAL
// index.html shell (kept in memory) so every route boots a fresh SPA render,
// even after we have started writing prerendered files into dist/.
function startServer(originalShell) {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const ext = extname(urlPath);
    if (ext) {
      const filePath = join(DIST, urlPath);
      try {
        const s = await stat(filePath);
        if (!s.isDirectory()) {
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
          res.end(await readFile(filePath));
          return;
        }
      } catch {
        /* fall through to shell */
      }
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(originalShell);
  });
  return new Promise((res) => server.listen(0, '127.0.0.1', () => res(server)));
}

async function writeRouteHtml(routePath, html) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  const outDir = clean ? resolve(DIST, clean) : DIST;
  if (clean) await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html, 'utf8');
}

async function prerenderRoute(browser, origin, routePath) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1366, height: 900 });

    // Block images/media/fonts during capture: their tags (with src/alt) are
    // still serialised into the HTML, but not downloading the bytes keeps the
    // network quiet so it actually reaches idle. Without this, the autoplaying
    // hero <video> streams forever and the page never settles (which both timed
    // pages out and captured them before their data-fetch render flushed). API
    // calls (fetch/xhr), scripts and CSS are always allowed through.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'media', 'font'].includes(req.resourceType())) req.abort();
      else req.continue();
    });

    // domcontentloaded (not networkidle) so navigation itself never hangs on the
    // streaming video; we then wait for the app + its data explicitly.
    await page.goto(`${origin}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page
      .waitForFunction(() => document.querySelector('#root')?.childElementCount > 0, { timeout: 20000 })
      .catch(() => {});
    // Let the API fetches settle, then give React a beat to flush the render
    // that those responses trigger (this is what fills the product grids).
    await page.waitForNetworkIdle({ idleTime: 700, timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));

    const html = await page.content();
    await writeRouteHtml(routePath, html);
    return true;
  } catch (err) {
    console.warn(`[prerender] ${routePath} failed: ${err.message}`);
    return false;
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  if (!existsSync(resolve(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — run after `vite build`. Skipping.');
    return;
  }

  const executablePath = findBrowser();
  if (!executablePath) {
    console.warn(
      '[prerender] No Chrome/Edge found. Skipping prerender — the app still ships with ' +
      'client-rendered meta tags. Set PUPPETEER_EXECUTABLE_PATH to enable SSG.',
    );
    return;
  }

  const originalShell = await readFile(resolve(DIST, 'index.html'), 'utf8');
  let routes = await readRoutes();
  const max = Number(process.env.PRERENDER_MAX) || 0;
  if (max > 0) routes = routes.slice(0, max);

  const server = await startServer(originalShell);
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Prerendering is a trusted build-time step, but the app fetches the live
      // API from this throwaway localhost origin, which the backend's CORS would
      // reject — causing the app to fall back to mock/empty data in the snapshot.
      // Disabling web security in THIS headless browser only (never shipped to
      // users) lets those cross-origin fetches succeed so real product data is
      // baked into the prerendered HTML.
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process,BlockInsecurePrivateNetworkRequests',
    ],
  });

  const concurrency = Math.max(1, Number(process.env.PRERENDER_CONCURRENCY) || 4);
  let ok = 0;
  let done = 0;
  const queue = [...routes];

  async function worker() {
    while (queue.length) {
      const routePath = queue.shift();
      const success = await prerenderRoute(browser, origin, routePath);
      if (success) ok += 1;
      done += 1;
      if (done % 10 === 0 || done === routes.length) {
        console.log(`[prerender] ${done}/${routes.length} routes…`);
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: concurrency }, worker));
    console.log(`[prerender] Done — ${ok}/${routes.length} routes written to dist/.`);
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

main().catch((err) => {
  console.error('[prerender] Unexpected error:', err);
  // Never fail the build because of prerendering.
  process.exit(0);
});
