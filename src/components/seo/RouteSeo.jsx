import { useLocation } from 'react-router-dom';
import Seo from './Seo.jsx';
import { buildOrganization, buildWebSite } from './schema.js';
import {
  STATIC_ROUTES,
  NOINDEX_ROUTES,
  CANONICAL_ALIASES,
  DYNAMIC_PREFIXES,
} from './staticRoutes.js';

const STATIC_MAP = new Map(STATIC_ROUTES.map((r) => [r.path, r]));
const NOINDEX_MAP = new Map(NOINDEX_ROUTES.map((r) => [r.path, r]));

// Site-wide structured data, emitted once on the homepage so it isn't repeated
// on every page.
const HOME_JSON_LD = [buildOrganization(), buildWebSite()];

/**
 * Renders <Seo> for the current route based on the static route table. Mounted
 * once in the Layout. Data-driven pages (product / collection) render their own
 * <Seo>, so this resolver returns nothing for those paths to avoid a duplicate
 * <title>. Unknown paths (e.g. the 404) get a safe noindex default.
 */
export default function RouteSeo() {
  const { pathname } = useLocation();

  // Data-driven pages own their metadata.
  if (DYNAMIC_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const noindex = NOINDEX_MAP.get(pathname);
  if (noindex) return <Seo title={noindex.title} noindex />;

  const canonicalPath = CANONICAL_ALIASES[pathname];
  const target = STATIC_MAP.get(canonicalPath || pathname);

  if (target) {
    return (
      <Seo
        title={target.title}
        description={target.description}
        canonicalPath={canonicalPath || target.path}
        jsonLd={target.path === '/' ? HOME_JSON_LD : undefined}
      />
    );
  }

  // Unrecognised path (404 / not-found) — don't let it get indexed.
  return <Seo title="Page Not Found" noindex />;
}
