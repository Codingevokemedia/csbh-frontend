import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Absolute origin used for every canonical URL. Canonicals must be absolute
// (Google ignores relative/inconsistent-host canonicals), so this is the single
// source of truth for the production host.
export const SITE_ORIGIN = 'https://cstimepieces.com';

// Build the canonical URL for a given route path:
//  • Uses the pathname only — query strings (?sort=, ?q=, ?page=) and hashes are
//    dropped so filtered/sorted/paginated variants all fold into one canonical.
//  • Strips a trailing slash on sub-paths ("/about/" -> "/about") to avoid
//    duplicate-URL variants, while keeping the site root as "/".
export function buildCanonicalUrl(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return SITE_ORIGIN + path;
}

// Keeps exactly one <link rel="canonical"> in <head>, updated on every client-side
// navigation. It reuses the tag already shipped in index.html (or creates one if
// missing), so a page can never end up with two canonical tags.
export default function Canonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    const href = buildCanonicalUrl(pathname);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [pathname]);

  return null;
}
