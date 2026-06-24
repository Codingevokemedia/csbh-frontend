// A self-contained <csbh-3d-viewer> custom element that wraps Google's
// <model-viewer> for interactive 3D + AR. Ported from the Evoke marketplace's
// AR viewer: model-viewer is loaded once from a CDN at runtime (so there's no
// build dependency), then mounted inside this element's shadow DOM with the
// rotation / AR attributes configured. Import this module once (e.g. a dynamic
// import in an effect) before rendering <csbh-3d-viewer> in JSX.

const MODEL_VIEWER_SCRIPT =
  'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

let modelViewerScriptPromise = null;

// Inject the model-viewer module script a single time and resolve once the
// custom element is defined. Subsequent calls reuse the same promise.
function ensureModelViewerScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.customElements?.get('model-viewer')) return Promise.resolve();
  if (!modelViewerScriptPromise) {
    modelViewerScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        `script[src="${MODEL_VIEWER_SCRIPT}"]`,
      );
      if (existing) {
        customElements.whenDefined('model-viewer').then(resolve).catch(reject);
        return;
      }
      const script = document.createElement('script');
      script.src = MODEL_VIEWER_SCRIPT;
      script.type = 'module';
      script.onload = () =>
        customElements.whenDefined('model-viewer').then(resolve);
      script.onerror = () =>
        reject(new Error('Failed to load model-viewer'));
      document.head.appendChild(script);
    });
  }
  return modelViewerScriptPromise;
}

function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

class Viewer extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadow.innerHTML = `<style>
      .model-viewer {
        width: 100%;
        min-height: 360px;
        height: 60vh;
        background-color: #fff;
      }
      canvas { width: 100% !important; height: 60vh !important; }
      .ar_button {
        cursor: pointer;
        width: 200px;
        height: 42px;
        position: absolute;
        bottom: 16px;
        left: 50%;
        border: 0;
        outline: none;
        background: #C9A84C;
        border-radius: 45px;
        font-size: 14px;
        color: #fff;
        font-weight: 600;
        letter-spacing: .04em;
        transform: translateX(-50%);
      }
      .ar_button:hover { background: #b8963f; }
      .span-arrow { padding-left: 6px; font-size: 11px; }
      .viewer-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 360px;
        height: 60vh;
        color: #64748b;
        font-size: 14px;
      }
    </style>`;
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const loading = document.createElement('div');
    loading.className = 'viewer-loading';
    loading.textContent = 'Loading 3D viewer…';
    this.shadow.appendChild(loading);

    ensureModelViewerScript()
      .then(() => {
        loading.remove();
        this._mountModelViewer();
      })
      .catch((err) => {
        console.error(err);
        loading.textContent =
          'Could not load 3D viewer. Please refresh and try again.';
      });
  }

  _mountModelViewer() {
    this.modelViewer = document.createElement('model-viewer');
    const src = this.getAttribute('src');
    if (src) this.modelViewer.setAttribute('src', src);
    if (this.getAttribute('ios-src')) {
      this.modelViewer.setAttribute('ios-src', this.getAttribute('ios-src'));
    }
    if (this.getAttribute('poster')) {
      this.modelViewer.setAttribute('poster', this.getAttribute('poster'));
    }
    this.modelViewer.setAttribute('ar', '');
    this.modelViewer.setAttribute('ar-modes', 'scene-viewer webxr quick-look');
    this.modelViewer.setAttribute('camera-controls', '');
    this.modelViewer.setAttribute('auto-rotate', '');
    this.modelViewer.setAttribute('autoplay', '');
    this.modelViewer.setAttribute('shadow-intensity', '1.5');
    this.modelViewer.setAttribute('exposure', '1');
    this.modelViewer.classList.add('model-viewer');
    this.modelViewer.style.backgroundColor = 'white';

    const arButton = createElementFromHTML(
      '<button slot="ar-button" class="ar_button">Enter AR experience<span class="span-arrow">&gt;</span></button>',
    );
    this.modelViewer.appendChild(arButton);
    this.shadow.appendChild(this.modelViewer);

    this.modelViewer.addEventListener('error', (e) =>
      console.error('model-viewer error:', e),
    );
  }

  static get observedAttributes() {
    return ['src', 'ios-src'];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (!this.modelViewer || !newVal) return;
    if (name === 'src') this.modelViewer.setAttribute('src', newVal);
    if (name === 'ios-src') this.modelViewer.setAttribute('ios-src', newVal);
  }
}

if (
  typeof window !== 'undefined' &&
  !customElements.get('csbh-3d-viewer')
) {
  customElements.define('csbh-3d-viewer', Viewer);
}
