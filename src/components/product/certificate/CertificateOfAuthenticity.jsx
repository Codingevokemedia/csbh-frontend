import styles from './CertificateOfAuthenticity.module.css';

const LOGO_SRC = '/images/evoke.svg';
const SUBTITLE =
  'This document certifies that the item described below is an original and authentic piece, crafted with the highest quality materials and exceptional craftsmanship.';

export default function CertificateOfAuthenticity({ rows = [], imageUrl, imageAlt = 'Product' }) {
  return (
    <div className={styles.frame}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Certificate of Authenticity</h2>
        <p className={styles.subtitle}>{SUBTITLE}</p>

        <div className={styles.body}>
          <div className={styles.rows}>
            <img src={LOGO_SRC} alt="" aria-hidden="true" className={styles.rowsWatermark} loading="lazy" decoding="async" />
            {rows.map((row, index) => (
              <div className={styles.row} key={`${row.label}-${index}`}>
                <span className={styles.rowLabel}>&bull; {row.label}:</span>
                <span className={styles.rowValue}>{row.value}</span>
              </div>
            ))}
            <div className={styles.row}>
              <span className={styles.rowLabel}>&bull; Order ID:</span>
              <span className={styles.rowValue} />
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.mediaBlock}>
              <div className={`${styles.imageWrap} ${imageUrl ? '' : styles.imagePlaceholder}`}>
                {imageUrl ? (
                  <img src={imageUrl} alt={imageAlt} className={styles.image} loading="lazy" decoding="async" />
                ) : (
                  <span>No product image</span>
                )}
              </div>
              <div className={styles.logoWrap}>
                <img src={LOGO_SRC} alt="EVOKE" className={styles.logo} loading="lazy" decoding="async" />
              </div>
            </div>

            <div className={styles.dateBlock}>
              <span className={styles.dateValue} />
              <div className={styles.dateLine} />
              <span className={styles.dateCaption}>Date Signed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
