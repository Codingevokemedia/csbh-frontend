// Pagination control — matches the CS Beverly Hills design language
// (font-sans, gold accents, uppercase tracking). Renders a windowed page list
// with ellipses for long ranges. Purely presentational: the parent owns `page`.

function buildPageList(current, total) {
  // Always show first/last; show a window of neighbours around the current page;
  // collapse the gaps with an ellipsis marker ('…').
  const delta = 1;
  const pages = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);
  if (left > 2) pages.push('…');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onChange(next);
  };

  const pages = buildPageList(page, totalPages);

  const arrowBase =
    'inline-flex items-center justify-center min-w-[40px] min-h-[40px] px-3 font-sans text-[11px] tracking-widest uppercase border transition-all duration-200 active:scale-[0.97]';

  return (
    <nav
      className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12"
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className={`${arrowBase} border-cloud text-steel hover:border-ink hover:text-ink disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Previous page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] font-sans text-[11px] text-mist select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex items-center justify-center min-w-[40px] min-h-[40px] px-2 font-sans text-[11px] tracking-widest uppercase border transition-all duration-200 active:scale-[0.97] ${
              p === page
                ? 'border-gold text-gold bg-gold/5 font-semibold'
                : 'border-cloud text-steel hover:border-ink hover:text-ink'
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className={`${arrowBase} border-cloud text-steel hover:border-ink hover:text-ink disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Next page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4.5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
