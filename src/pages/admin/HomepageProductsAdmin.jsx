import { useEffect, useState, useCallback } from 'react';
import {
  HOMEPAGE_SECTIONS,
  listHomepageProducts,
  searchHomepageCandidates,
  addHomepageProduct,
  updateHomepageProduct,
  reorderHomepageProducts,
  removeHomepageProduct,
} from '../../services/homepageProducts.js';
import { getStoreProducts, getProductById } from '../../services/products.js';
import { adminLogout } from '../../services/adminAuth.js';
import { useNavigate } from 'react-router-dom';

const usd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);

// Manage which Evoke products appear on each CSBH homepage section. Stores only
// references via the CSBH backend; all product data is read live from Evoke.
export default function HomepageProductsAdmin() {
  const navigate = useNavigate();
  const [sectionKey, setSectionKey] = useState('bestsellers');
  const section = HOMEPAGE_SECTIONS.find((s) => s.key === sectionKey);
  const target = section?.target || 0;

  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);

  const [rows, setRows]       = useState([]);   // managed rows + hydrated product
  const [counts, setCounts]   = useState({});   // active counts per section
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const activeCount = rows.filter((r) => r.is_active).length;
  const remaining = Math.max(0, target - activeCount);

  // Load active counts for every section (for the tab badges).
  const loadCounts = useCallback(async () => {
    try {
      const all = await Promise.all(
        HOMEPAGE_SECTIONS.map((s) =>
          listHomepageProducts(s.key, { activeOnly: true })
            .then((r) => [s.key, r.length])
            .catch(() => [s.key, 0]),
        ),
      );
      setCounts(Object.fromEntries(all));
    } catch { /* non-critical */ }
  }, []);

  // Load + hydrate the managed list for the current section.
  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const refs = await listHomepageProducts(sectionKey);
      const catalogue = await getStoreProducts().catch(() => []);
      const byId = new Map((catalogue || []).map((p) => [String(p.id), p]));
      const hydrated = await Promise.all(
        refs.map(async (r) => {
          let p = byId.get(String(r.product_id));
          if (!p) { try { p = await getProductById(r.product_id); } catch { p = null; } }
          return { ...r, product: p };
        }),
      );
      setRows(hydrated);
    } catch (e) {
      setError(e.message || 'Failed to load homepage products');
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadCounts(); }, [loadCounts, rows]);

  // Debounced product search.
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      searchHomepageCandidates(q)
        .then((r) => setResults(r))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const alreadyAdded = (productId) => rows.some((r) => String(r.product_id) === String(productId));

  async function handleAdd(productId) {
    if (alreadyAdded(productId)) { flash('Already in this section'); return; }
    setBusyId(`add-${productId}`);
    try {
      await addHomepageProduct({ product_id: Number(productId), section: sectionKey });
      await loadList();
      flash('Added to homepage');
    } catch (e) {
      flash(e.message || 'Failed to add');
    } finally { setBusyId(null); }
  }

  async function handleToggle(row) {
    setBusyId(row.id);
    try {
      await updateHomepageProduct(row.id, { is_active: !row.is_active });
      await loadList();
    } catch (e) { flash(e.message || 'Failed to update'); }
    finally { setBusyId(null); }
  }

  async function handleRemove(row) {
    setBusyId(row.id);
    try {
      await removeHomepageProduct(row.id);
      await loadList();
      flash('Removed');
    } catch (e) { flash(e.message || 'Failed to remove'); }
    finally { setBusyId(null); }
  }

  async function move(index, dir) {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const reordered = [...rows];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setRows(reordered); // optimistic
    try {
      await reorderHomepageProducts(reordered.map((r, i) => ({ id: r.id, display_order: i })));
    } catch (e) { flash(e.message || 'Failed to reorder'); loadList(); }
  }

  // Status pill describing how many active products vs. the target.
  const status = activeCount === target
    ? { text: `Complete — ${target} active`, cls: 'text-green-700 bg-green-50 border-green-200' }
    : activeCount < target
      ? { text: `Add ${remaining} more (${activeCount}/${target})`, cls: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { text: `${activeCount}/${target} — extras won't show`, cls: 'text-steel bg-bone border-cloud' };

  return (
    <div className="bg-cream min-h-[100dvh]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-10 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] tracking-[0.35em] uppercase font-semibold text-gold">Admin</span>
            <h1 className="font-display text-2xl sm:text-4xl text-ink font-light">CSBH Homepage Products</h1>
            <p className="font-sans text-sm text-steel mt-1 max-w-2xl">
              Pick which Evoke Marketplace watches appear on the homepage. Search a product,
              click <b className="text-ink font-semibold">Add</b>, then reorder or enable/disable as needed.
              Only the product reference is saved — names, images and prices always come live from Evoke.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => { await adminLogout(); navigate('/admin/login', { replace: true }); }}
            className="shrink-0 font-sans text-[11px] font-semibold tracking-widest uppercase border border-cloud text-steel hover:border-steel hover:text-ink px-4 py-2 rounded transition-all"
          >
            Log out
          </button>
        </div>

        {/* Section tabs with live counts */}
        <div className="flex flex-wrap gap-2 mb-6">
          {HOMEPAGE_SECTIONS.map((s) => {
            const c = counts[s.key];
            const active = sectionKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => { setSectionKey(s.key); setQuery(''); setResults([]); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-sans transition-all ${
                  active ? 'border-gold bg-gold/10 text-ink' : 'border-cloud bg-white text-steel hover:border-steel'
                }`}
              >
                <span className="font-semibold">{s.label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? 'bg-gold text-white' : 'bg-pearl text-steel'}`}>
                  {c == null ? '–' : `${c}/${s.target}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current-section guidance banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-cloud bg-white rounded-lg px-5 py-4 mb-8">
          <div>
            <p className="font-sans text-[14px] text-ink font-semibold">
              {section?.label} — needs {target} product{target === 1 ? '' : 's'}
            </p>
            <p className="font-sans text-[12px] text-steel mt-0.5">{section?.blurb}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 sm:min-w-[220px]">
            <span className={`font-sans text-[12px] font-semibold px-3 py-1 rounded-full border ${status.cls}`}>
              {status.text}
            </span>
            {/* Progress bar */}
            <div className="w-full sm:w-[220px] h-1.5 rounded-full bg-pearl overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, target ? (activeCount / target) * 100 : 0)}%`,
                  background: activeCount >= target ? '#15803d' : '#CA8A04',
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
          {/* ── Search + add ───────────────────────────────────────────── */}
          <section>
            <h2 className="font-sans text-[11px] tracking-widest uppercase text-steel mb-3">1 · Search & Add Products</h2>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, product ID, or SKU…"
                className="w-full border border-cloud bg-white text-ink font-sans text-sm pl-10 pr-4 py-3 placeholder:text-mist focus:outline-none focus:border-steel"
                style={{ outline: 'none' }}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
              {!query.trim() && (
                <p className="font-sans text-[12px] text-mist py-6 text-center">Start typing to find watches.</p>
              )}
              {searching && <p className="font-sans text-[12px] text-mist">Searching…</p>}
              {!searching && query.trim() && results.length === 0 && (
                <p className="font-sans text-[12px] text-mist">No products match “{query.trim()}”.</p>
              )}
              {results.map((p) => {
                const added = alreadyAdded(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-2.5 sm:gap-3 border border-cloud bg-white p-2.5 rounded-lg">
                    <img src={p.image || ''} alt="" className="w-14 h-14 sm:w-16 sm:h-16 object-cover bg-pearl rounded shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[13px] text-ink truncate">{p.name}</p>
                      <p className="font-sans text-[11px] text-mist truncate">ID: {p.id}{p.sku ? ` · SKU: ${p.sku}` : ''}</p>
                      <p className="font-sans text-[12px] font-semibold text-gold mt-0.5">{usd(p.price)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === `add-${p.id}` || added}
                      onClick={() => handleAdd(p.id)}
                      className={`shrink-0 px-3.5 py-2 text-[11px] font-sans font-semibold uppercase tracking-wide rounded transition-all ${
                        added
                          ? 'border border-green-200 text-green-700 bg-green-50 cursor-default'
                          : 'border border-ink text-ink hover:bg-ink hover:text-white'
                      } disabled:opacity-50`}
                    >
                      {added ? '✓ Added' : busyId === `add-${p.id}` ? 'Adding…' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Managed list ───────────────────────────────────────────── */}
          <section>
            <h2 className="font-sans text-[11px] tracking-widest uppercase text-steel mb-3">
              2 · On Homepage <span className="text-mist normal-case tracking-normal">(drag order with ▲▼)</span>
            </h2>

            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[84px] rounded-lg bg-pearl/60 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <p className="font-sans text-[13px] text-red-700">{error}</p>
                <button onClick={loadList} className="mt-2 font-sans text-[12px] underline text-red-700">Retry</button>
              </div>
            ) : rows.length === 0 ? (
              <div className="border border-dashed border-cloud rounded-lg py-14 text-center">
                <p className="font-sans text-[13px] text-steel">No products in this section yet.</p>
                <p className="font-sans text-[12px] text-mist mt-1">Search on the left and add {target} to fill it.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rows.map((row, i) => {
                  const overTarget = i >= target; // beyond what the homepage shows
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-2 sm:gap-3 border bg-white p-2 sm:p-2.5 rounded-lg ${row.is_active ? 'border-cloud' : 'border-cloud bg-bone/40'}`}
                    >
                      {/* Position + reorder */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-4 sm:w-6 text-center font-sans text-[12px] font-semibold ${overTarget ? 'text-mist' : 'text-ink'}`}>{i + 1}</span>
                        <div className="flex flex-col">
                          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"
                            className="w-6 h-5 flex items-center justify-center text-steel hover:text-ink disabled:opacity-25 text-[11px]">▲</button>
                          <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down"
                            className="w-6 h-5 flex items-center justify-center text-steel hover:text-ink disabled:opacity-25 text-[11px]">▼</button>
                        </div>
                      </div>
                      <img src={row.product?.image || ''} alt="" className={`w-12 h-12 sm:w-16 sm:h-16 object-cover bg-pearl rounded shrink-0 ${row.is_active ? '' : 'grayscale opacity-60'}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] text-ink truncate">{row.product?.title || `Product ${row.product_id}`}</p>
                        <p className="font-sans text-[11px] text-mist truncate">ID: {row.product_id}{row.product?.sku ? ` · SKU: ${row.product.sku}` : ''}</p>
                        {row.product?.price != null && (
                          <p className="font-sans text-[12px] font-semibold text-gold mt-0.5">{usd(row.product.price)}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => handleToggle(row)}
                          className={`px-3 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-wide rounded border transition-all disabled:opacity-40 ${
                            row.is_active ? 'border-green-300 text-green-700 bg-green-50' : 'border-mist text-mist bg-white'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => handleRemove(row)}
                          className="px-3 py-1 text-[11px] font-sans text-red-600 hover:underline disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Marker showing where the visible cutoff is */}
                {rows.length > target && (
                  <p className="font-sans text-[11px] text-mist text-center mt-1">
                    Only the first {target} active products show on the homepage.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white font-sans text-[13px] px-5 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
