import { useEffect, useState } from 'react';
import styles from './ProductExtras.module.css';

// Google's <model-viewer> (3D + AR), loaded only when a shopper opens the viewer.
const MODEL_VIEWER_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
let loader = null;

function loadModelViewer() {
  if (window.customElements?.get('model-viewer')) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = MODEL_VIEWER_SRC;
      script.onload = () => customElements.whenDefined('model-viewer').then(resolve);
      script.onerror = () => {
        loader = null;
        reject(new Error('model-viewer failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return loader;
}

/** "View in 3D & AR" button + popup, shown only when the product has a 3D model. */
export default function View3D({ src, name }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('loading');

  useEffect(() => {
    if (!open) return undefined;
    setState('loading');
    loadModelViewer().then(() => setState('ready')).catch(() => setState('error'));
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      <button type="button" className={styles.iconBtn} onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2 3 7v10l9 5 9-5V7z" />
          <path d="m3 7 9 5 9-5M12 12v10" />
        </svg>
        View in 3D &amp; AR
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} role="presentation">
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={`${name || 'Product'} in 3D`} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogTitle}>{name || 'Product'} · 3D view</p>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close 3D view" autoFocus>
              ×
            </button>
            {state === 'ready' ? (
              <model-viewer
                className={styles.viewer}
                src={src}
                alt={name || 'Product 3D model'}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
              />
            ) : (
              <div className={styles.viewerStatus}>
                {state === 'error' ? 'Could not load the 3D viewer. Please try again.' : 'Loading 3D viewer…'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
