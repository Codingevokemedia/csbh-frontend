import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ProductOffers.module.css';
import { COUPON_TYPE, canApplyOffer, couponBadge, describeOffer, formatUsd, priceWithOffer, sortOffers } from './offers';

const TagsIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * "Check offers" button + side panel (same behaviour as the Evoke marketplace
 * product page, styled per storefront through `theme` — CSS variables).
 * The applied code travels to the Evoke cart in the Add to Cart / Buy Now link
 * (?coupon=), where it is checked for the shopper's account and applied.
 * Renders nothing when the product has no offers.
 */
export default function ProductOffers({
  productId,
  loadOffers,
  price,
  appliedCode,
  onChange,
  style,
  theme,
  applyHint = 'It is applied in your cart at checkout.',
}) {
  const [offers, setOffers] = useState([]);
  const [open, setOpen] = useState(false);
  const [labelIndex, setLabelIndex] = useState(0);
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setOffers([]);
    onChange?.(null);
    if (!productId) return undefined;
    Promise.resolve(loadOffers(productId))
      .then((list) => {
        if (!cancelled) setOffers(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const sorted = useMemo(() => sortOffers(offers, price), [offers, price]);
  const applied = sorted.find((o) => String(o.CouponCode).toLowerCase() === String(appliedCode || '').toLowerCase());

  // While an offer is applied, the button alternates "'CODE' applied" with the price.
  const frames = useMemo(() => {
    if (!applied) return [];
    const list = [`'${applied.CouponCode}' applied`];
    if (Number(applied.CouponTypeID) === COUPON_TYPE.FREE_SHIPPING) list.push('Getting free shipping');
    else list.push(`Getting it for ${formatUsd(priceWithOffer(applied, price).pay)}`);
    return list;
  }, [applied, price]);

  useEffect(() => {
    setLabelIndex(0);
    if (frames.length < 2) return undefined;
    const id = setInterval(() => setLabelIndex((i) => (i + 1) % frames.length), 2800);
    return () => clearInterval(id);
  }, [frames]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!offers.length) return null;

  const label = applied ? frames[labelIndex % frames.length] : 'Check offers';

  return (
    <div className={styles.wrap} style={{ ...theme, ...style }}>
      <button
        type="button"
        className={`${styles.offersButton} ${applied ? styles.offersButtonApplied : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className={styles.offersIcon}>
          <TagsIcon />
        </span>
        <span key={label} className={`${styles.offersLabel} ${applied ? styles.offersLabelSwap : ''}`}>
          {label}
        </span>
        {!applied && <span className={styles.offersCount}>{offers.length}</span>}
        <span className={styles.offersChevron}>
          <ChevronIcon />
        </span>
      </button>

      {open &&
        createPortal(
          <div className={styles.root} style={theme}>
            <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
            <aside className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="product-offers-title">
              <header className={styles.header}>
                <h2 id="product-offers-title" className={styles.title}>
                  Available offers
                </h2>
                <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close offers">
                  <CloseIcon />
                </button>
              </header>

              <div className={styles.body}>
                {sorted.map((offer) => {
                  const isApplied = applied?.CouponCode === offer.CouponCode;
                  const badge = couponBadge(offer);
                  const { pay, save } = priceWithOffer(offer, price);
                  const isFreeShipping = Number(offer.CouponTypeID) === COUPON_TYPE.FREE_SHIPPING;
                  return (
                    <article
                      key={offer.CouponCode}
                      className={`${styles.card} ${isApplied ? styles.cardApplied : ''} ${badge ? styles.cardWithBadge : ''}`}
                    >
                      {badge && <span className={styles.badge}>{badge}</span>}
                      <div className={styles.cardMain}>
                        <span className={`${styles.tagIcon} ${offer.Available ? styles.tagIconActive : ''}`} aria-hidden="true">
                          <TagsIcon />
                        </span>
                        <div className={styles.cardText}>
                          <div className={styles.code}>{offer.CouponCode}</div>
                          <div className={styles.desc}>{describeOffer(offer)}</div>
                        </div>
                        {!canApplyOffer(offer) ? (
                          <span className={styles.notApplicable}>Not applicable</span>
                        ) : isApplied ? (
                          <div className={styles.appliedActions}>
                            <span className={styles.appliedLabel}>
                              <CheckIcon /> Applied
                            </span>
                            <button type="button" className={styles.removeLink} onClick={() => onChange?.(null)}>
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button type="button" className={styles.applyBtn} onClick={() => onChange?.(offer.CouponCode)}>
                            Apply
                          </button>
                        )}
                      </div>
                      {canApplyOffer(offer) && (
                        <div className={styles.cardFooter}>
                          <span>You&apos;ll pay {formatUsd(isFreeShipping ? price : pay)}</span>
                          <span className={styles.save}>{isFreeShipping ? 'Free shipping' : `Save ${formatUsd(save)}`}</span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <footer className={styles.footer}>
                *One coupon per product. Sign-in offers are claimed with your Evoke account at checkout. Prices are per item. {applyHint}
              </footer>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
