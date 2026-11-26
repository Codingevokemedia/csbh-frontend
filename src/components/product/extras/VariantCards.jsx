import { useEffect, useRef, useState } from 'react';
import styles from './VariantCards.module.css';

// Loads its image only once it scrolls into view inside the variant grid, so
// the full-size photos for rows hidden in the scroll area aren't downloaded.
function GridImage({ src, gridRef }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: gridRef.current, rootMargin: '40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [gridRef, visible]);

  return (
    <span ref={ref} className={styles.image}>
      {visible && <img src={src} alt="" decoding="async" />}
    </span>
  );
}

/**
 * Variant picker: small rectangular cards (photo, name, price) in a wrapping
 * grid that scrolls vertically past ~3 rows (like the Evoke marketplace).
 * `items`: [{ id, name, price, image, soldOut }]. Styled per site via `theme`.
 */
export default function VariantCards({ items, selectedId, onSelect, formatPrice, theme }) {
  const gridRef = useRef(null);
  return (
    <div ref={gridRef} className={styles.grid} style={theme}>
      {items.map((v) => {
        const active = String(v.id) === String(selectedId);
        return (
          <button
            key={v.id}
            type="button"
            disabled={v.soldOut}
            aria-pressed={active}
            title={v.name}
            onClick={() => onSelect(active ? null : v.id)}
            className={`${styles.card} ${active ? styles.active : ''}`}
          >
            {v.image && <GridImage src={v.image} gridRef={gridRef} />}
            <span className={styles.text}>
              <span className={styles.name}>{v.name}</span>
              <span className={styles.price}>{v.soldOut ? 'Sold out' : formatPrice(v.price)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
