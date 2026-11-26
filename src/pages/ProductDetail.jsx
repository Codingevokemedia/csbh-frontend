import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductBySlug, getProductsByCollection, getProductVariants, getProductOffers, notifyBackInStock, isStoreProduct } from '../services/products.js';
import { addRecentlyViewed } from '../lib/recentlyViewed.js';
import ProductOffers from '../components/product/extras/ProductOffers.jsx';
import NotifyMe from '../components/product/extras/NotifyMe.jsx';
import ShareButton from '../components/product/extras/ShareButton.jsx';
import VariantCards from '../components/product/extras/VariantCards.jsx';
import useProductImageZoom from '../components/product/zoom/useProductImageZoom.jsx';
import extrasStyles from '../components/product/extras/ProductExtras.module.css';

const EXTRAS_THEME = {
  '--px-ink': '#2C2B35',
  '--px-muted': '#595667',
  '--px-border': '#E0DFDB',
  '--px-accent': '#2C2B35',
};
// Offers button + panel in the CS Beverly Hills look: cream, Montserrat /
// Cormorant, gold accent, wide uppercase tracking.
const OFFERS_THEME = {
  '--of-ink': '#2C2B35',
  '--of-muted': '#595667',
  '--of-border': '#E0DFDB',
  '--of-panel': '#FAFAF7',
  '--of-surface': '#FFFFFF',
  '--of-accent': '#CA8A04',
  '--of-accent-text': '#FFFFFF',
  '--of-success': '#4D7C0F',
  '--of-radius': '0px',
  '--of-font': 'var(--font-sans)',
  '--of-display': 'var(--font-display)',
  '--of-tracking': '0.16em',
};
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductTabs from '../components/product/ProductTabs.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Button from '../components/ui/Button.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import Seo from '../components/seo/Seo.jsx';
import { buildProduct, buildBreadcrumb } from '../components/seo/schema.js';

// A gallery entry is a video when its URL points at a video file. The backend's
// photos-and-videos collection mixes both, so we branch on the extension.
const isVideoUrl = (url) => /\.(mp4|webm|mov|ogg|m4v)(\?|#|$)/i.test(String(url || ''));

// Turn the flat attribute list into selectable groups. A single attribute value
// can be comma-separated (e.g. Watch Type "Casio,Edifice,Chronograph"), so each
// comma-separated token becomes its own selectable chip.
function buildAttributeGroups(attributes) {
  return (attributes || [])
    .map((a) => ({
      name: a.name,
      options: String(a.value).split(',').map((s) => s.trim()).filter(Boolean),
    }))
    .filter((g) => g.name && g.options.length);
}

// Variant cards in the CSBH look: rounded, gold accent.
const VARIANT_THEME = {
  '--vc-ink': 'var(--color-ink)',
  '--vc-muted': 'var(--color-steel)',
  '--vc-border': 'var(--color-cloud)',
  '--vc-accent': 'var(--color-gold)',
  '--vc-active-bg': 'rgba(202,138,4,0.08)',
  '--vc-surface': '#ffffff',
  '--vc-radius': '8px',
  '--vc-font': 'var(--font-sans)',
};

export default function ProductDetail() {
  // The URL is /product/:id/:slug (id-first) — older /product/:slug links still
  // work via the slug fallback below.
  const { id, slug }                    = useParams();
  const productKey                      = id || slug;
  const [product, setProduct]           = useState(null);
  const [related, setRelated]           = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [couponCode, setCouponCode]     = useState(null);
  const [activeImg, setActiveImg]       = useState(0);
  const [imgLoading, setImgLoading]     = useState(true);
  const [quantity, setQuantity]         = useState(1);
  const [variant, setVariant]           = useState(null);
  const [variants, setVariants]         = useState([]);
  const [isAdding, setIsAdding]         = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  // 3D / AR viewer (model-viewer) — only shown when the product has a 3D asset.
  const [is3DOpen, setIs3DOpen]         = useState(false);
  // Platform drives the button label (AR is mobile-only). Computed once on mount.
  const [platform] = useState(() => {
    if (typeof navigator === 'undefined') return 'Other';
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
    return 'Other';
  });

  const [lifestyleZoomIdx, setLifestyleZoomIdx] = useState(0);
  const tabsRef = useRef(null);
  const thumbRailRef = useRef(null);
  const lifestyleRef = useRef(null);

  // "Read more" jumps to the About Product section below (its default tab).
  const scrollToAbout = () => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Up/down arrows scroll the vertical thumbnail rail by ~2 thumbnails.
  const scrollThumbs = (dir) => thumbRailRef.current?.scrollBy({ top: dir * 182, behavior: 'smooth' });

  // Slide the lifestyle carousel by one image (visible 4 on desktop, 2 on mobile).
  const scrollLifestyle = (dir) => {
    const el = lifestyleRef.current;
    if (!el) return;
    const item = el.querySelector(':scope > *');
    const step = item ? item.offsetWidth + 16 : el.clientWidth / 2;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const { addAndRedirect, loading: cartLoading } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveImg(0);
    setImgLoading(true);
    setVariants([]);
    setRelated([]);
    let currentId = null;
    getProductBySlug(productKey)
      .then(p => {
        if (!p) throw new Error('Product not found.');
        currentId = String(p.id);
        setProduct(p);
        setVariant(p.variants?.find(v => v.inStock) || p.variants?.[0] || null);
        // Pre-select the first option of each attribute group so the cart
        // always carries a complete attribute set; the shopper can change them.
        const groups = buildAttributeGroups(p.attributes);
        setSelectedAttrs(Object.fromEntries(groups.map(g => [g.name, g.options[0]])));
        // Variants come from a dedicated endpoint — keyed by the real product id
        // (the URL slug may now be the product name).
        getProductVariants(p.id).then((vs) => {
          setVariants(vs);
        });
        // Record this CSBH product as recently viewed; show the shopper's others.
        if (isStoreProduct(p)) {
          const list = addRecentlyViewed({
            id: p.id, slug: p.slug, title: p.title, image: p.image,
            price: p.price, compareAtPrice: p.compareAtPrice,
            inStock: p.inStock, stockQuantity: p.stockQuantity,
          });
          setRecentlyViewed(list.filter(p2 => String(p2.id) !== String(p.id)).slice(0, 4));
        }
        // Show the product now; the related row fills in when it arrives.
        setLoading(false);
        getProductsByCollection(p.collection)
          .then(all => setRelated(all.filter(p2 => String(p2.id) !== currentId).slice(0, 4)))
          .catch(() => {});
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [productKey]);

  // Register the <csbh-3d-viewer> web component (it lazy-loads model-viewer
  // from a CDN on first use).
  useEffect(() => {
    import('../lib/arViewer.js');
  }, []);

  const handleActiveImgChange = (i) => {
    if (i === activeImg) return;
    setImgLoading(true);
    setActiveImg(i);
  };

  // Fullscreen zoom viewer (same as the Evoke marketplace product page):
  // click the main image on desktop, or the expand button on any device.
  // Called before the early returns below, so it works from the same gallery
  // the page renders (the selected variant's images when it has them).
  const zoomVariant = variants.find((v) => v.label === selectedAttrs['Options']);
  const zoomGallery = product ? (zoomVariant?.images?.length ? zoomVariant.images : product.gallery) || [] : [];
  const zoomMedia = zoomGallery.length ? zoomGallery : product?.image ? [product.image] : [];
  const { onMainImageClick, FullscreenTrigger, FullscreenViewer } = useProductImageZoom({
    images: zoomMedia,
    selectedIndex: Math.min(activeImg, Math.max(0, zoomMedia.length - 1)),
    onSelectIndex: handleActiveImgChange,
    getImageAlt: () => product?.title || '',
  });

  // Same click-to-open viewer for the lifestyle images.
  const lifestyleZoom = useProductImageZoom({
    images: product?.lifestyleImages || [],
    selectedIndex: lifestyleZoomIdx,
    onSelectIndex: setLifestyleZoomIdx,
    getImageAlt: () => `${product?.title || ''} lifestyle`,
  });
  const openLifestyleZoom = (i) => {
    setLifestyleZoomIdx(i);
    lifestyleZoom.openFullscreen();
  };

  if (loading) return <LoadingState fullPage message="Loading timepiece…" />;
  if (error || !product) return <ErrorState title="Timepiece Not Found" message={error || 'We could not find this product.'} />;

  // The variant the shopper has picked, with its own price / id / sku / stock /
  // images. Null until the shopper explicitly selects one (no auto-select).
  const selectedVariant = variants.length
    ? variants.find(v => v.label === selectedAttrs['Options']) || null
    : null;
  // Price reflects the selected variant when one is chosen.
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedVariant?.price ?? product.price);
  const usd2 = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart() {
    if (isAdding) return;
    setIsAdding(true);
    // Only send attributes the shopper actually has selected.
    const attributes = Object.fromEntries(
      Object.entries(selectedAttrs).filter(([, v]) => v),
    );
    await addAndRedirect({
      productId: product.id,
      variantId: selectedVariant?.id || variant?.id || product.id,
      quantity,
      productTitle: product.title,
      attributes,
      coupon: couponCode,
    });
    setIsAdding(false);
  }

  const shippingContent = <p className="font-sans text-sm text-steel leading-relaxed">Complimentary shipping on all orders. Dispatched within 1–2 business days. Signed delivery required for all luxury timepieces.</p>;
  const returnsContent = product.warranty ? <p className="font-sans text-sm text-steel leading-relaxed">All CS Beverly Hills timepieces carry a {product.warranty} manufacturer warranty.</p> : null;

  // Selectable attribute groups (Watch Type, Band Color, …) shown beneath the
  // description. Empty when the backend returns no attributes. Long lists scroll
  // inside a fixed-height panel so the Add to Cart CTA stays in view.
  const attributeGroups = buildAttributeGroups(product.attributes);
  function selectAttr(name, opt) {
    setSelectedAttrs((s) => ({ ...s, [name]: s[name] === opt ? undefined : opt }));
  }
  
  const getStockLabel = (item) => {

  return item?.stockQuantity != null && item?.stockQuantity > 0 &&
   item?.inStock ? `In Stock (${item.stockQuantity})` : 'Sold Out';

};

const stockLabel = selectedVariant
  ? getStockLabel(selectedVariant)
  : getStockLabel(product);

  const lifestyleImages = product.lifestyleImages || [];
  const EVOKE_SITE = import.meta.env.VITE_EVOKE_SITE_URL || 'https://www.evokemarketplace.com';

  // ── SEO ───────────────────────────────────────────────────────────────────
  // Meta description from the product copy (trimmed to a search-friendly length),
  // with Product + BreadcrumbList structured data. Canonical is the id-first URL
  // (/product/:id/:slug) that the product cards link to.
  const canonicalPath = `/product/${product.id}/${product.slug}`;
  const metaDescription = (product.description || `${product.title} — luxury timepiece from CS Beverly Hills.`)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);
  const productJsonLd = [
    buildProduct(product, { path: canonicalPath }),
    buildBreadcrumb([
      { name: 'Home', path: '/' },
      { name: product.collection, path: `/${product.collection}` },
      { name: product.title, path: canonicalPath },
    ]),
  ];

  // Gallery swaps to the selected variant's own images when it has them.
  const gallery = (selectedVariant?.images?.length ? selectedVariant.images : product.gallery) || [];
  // Currently-selected gallery media (photo or video).
  const activeMedia = gallery[activeImg] || product.image;
  const activeIsVideo = isVideoUrl(activeMedia);

  return (
    <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-10 lg:pt-16 pb-16">
      <Seo
        title={product.title}
        description={metaDescription}
        image={product.image}
        type="product"
        canonicalPath={canonicalPath}
        jsonLd={productJsonLd}
      />

      {/* Breadcrumb */}
      <nav className="flex items-baseline gap-2 mb-8 font-sans text-[14px] leading-none" aria-label="Breadcrumb">
        <Link to="/" className="text-mist hover:text-ink transition-colors">Home</Link>
        <span className="text-mist/50 select-none">/</span>
        <Link to={`/${product.collection}`} className="text-mist hover:text-ink transition-colors capitalize">{product.collection}</Link>
        <span className="text-mist/50 select-none">/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Gallery — vertical thumbnail rail (centered against the image) + main
            media. self-start stops the column from stretching to the taller info
            column (which would leave a big gap above the image). */}
        <div className="flex items-center gap-3 sm:gap-4 self-start lg:sticky lg:top-24">
          {/* Vertical thumbnails — scroll arrows + scrollable/swipeable rail.
              The rail is capped at ~5 thumbnails (with a peek of the next):
              5 × (thumb + gap) ≈ 360px mobile / 456px desktop. */}
          {gallery.length > 1 && (
            <div className="flex flex-col items-center gap-2 w-16 sm:w-20 shrink-0">
              {gallery.length > 5 && (
                <button
                  type="button"
                  onClick={() => scrollThumbs(-1)}
                  aria-label="Scroll thumbnails up"
                  className="w-8 h-8 rounded-full border border-cloud flex items-center justify-center text-steel hover:border-gold hover:text-gold transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              <div ref={thumbRailRef} className="thumb-scroll flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden max-h-[360px] sm:max-h-[456px] w-full overscroll-contain">
                {gallery.map((media, i) => {
                  const video = isVideoUrl(media);
                  return (
                    <button
                      key={i}
                      onClick={() => handleActiveImgChange(i)}
                      className={`relative shrink-0 w-full aspect-square overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-gold' : 'border-cloud opacity-60 hover:opacity-100'}`}
                      aria-label={video ? `Play video ${i + 1}` : `View image ${i + 1}`}
                    >
                      {video ? (
                        <>
                          <video src={media} muted playsInline className="w-full h-full object-cover" aria-hidden="true" />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                          </span>
                        </>
                      ) : (
                        <img src={media} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
              {gallery.length > 5 && (
                <button
                  type="button"
                  onClick={() => scrollThumbs(1)}
                  aria-label="Scroll thumbnails down"
                  className="w-8 h-8 rounded-full border border-cloud flex items-center justify-center text-steel hover:border-gold hover:text-gold transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          )}

          {/* Main media */}
          <div className="flex-1 min-w-0 relative">
            {/* View in 3D / AR — only when the product has a 3D model. Opens the
                model-viewer popup below. */}
            {product.model3dUrl && (
              <button
                type="button"
                onClick={() => setIs3DOpen(true)}
                className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 bg-gold text-white font-sans text-[11px] font-semibold tracking-widest uppercase px-3.5 py-2 rounded-full shadow-md hover:bg-gold/90 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
                {platform === 'Other' ? 'View in 3D' : 'View in 3D & AR'}
              </button>
            )}
            {activeIsVideo ? (
              /* Video media — no hover-zoom, native controls */
              <motion.div
                className="aspect-square bg-bone overflow-hidden border border-cloud relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <video
                  key={activeMedia}
                  src={activeMedia}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
                {FullscreenTrigger}
              </motion.div>
            ) : (
              <motion.div
                className="aspect-square bg-bone overflow-hidden border border-cloud cursor-zoom-in relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onMainImageClick}
              >
                {imgLoading && <div className="absolute inset-0 skeleton z-10" />}
                <img
                  src={activeMedia}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setImgLoading(false)}
                />
                {FullscreenTrigger}
              </motion.div>
            )}
            {FullscreenViewer}

            {/* 3D / AR viewer popup. <csbh-3d-viewer> lazy-loads model-viewer and
                renders an interactive, rotatable model with an Enter-AR button on
                supported devices. */}
            {is3DOpen && product.model3dUrl && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                role="dialog"
                aria-modal="true"
                aria-label="3D product viewer"
                onClick={() => setIs3DOpen(false)}
              >
                <div
                  className="relative w-full max-w-3xl bg-white border border-cloud shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setIs3DOpen(false)}
                    aria-label="Close 3D viewer"
                    className="absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-bone border border-cloud text-steel hover:border-gold hover:text-gold transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  <csbh-3d-viewer src={product.model3dUrl} style={{ display: 'block', width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-7">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              {product.isNew && <span className="bg-gold text-white text-[9px] font-sans font-bold tracking-widest uppercase px-2 py-0.5">New</span>}
              {product.isLimitedEdition && <span className="bg-pearl text-gold text-[9px] font-sans font-bold tracking-widest uppercase px-2 py-0.5 border border-gold/40">Limited Edition</span>}
              {!product.inStock && <span className="bg-bone text-mist text-[9px] font-sans tracking-widest uppercase px-2 py-0.5 border border-cloud">Sold Out</span>}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-light mt-3 leading-tight">{product.title}</h1>
            {product.limitedEditionNote && (
              <p className="font-sans text-[11px] text-gold mt-2">{product.limitedEditionNote}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans text-3xl font-semibold text-ink">{formatted}</span>
            {product.compareAtPrice && (
              <span className="font-sans text-lg text-mist line-through">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(product.compareAtPrice)}
              </span>
            )}
          </div>

          <ProductOffers
            productId={product.id}
            loadOffers={getProductOffers}
            price={selectedVariant?.price ?? product.price}
            appliedCode={couponCode}
            onChange={setCouponCode}
            theme={OFFERS_THEME}
            style={{ marginTop: 0 }}
          />

          {/* Availability + SKU + product type — dynamic from backend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 -mt-2">
            <span className="inline-flex items-center gap-2 font-sans text-[12px]">
              <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-[#34a853]' : 'bg-mist'}`} />
              <span className={product.inStock ? 'text-[#2f7d3f]' : 'text-mist'}>{stockLabel}</span>
            </span>
            {/* Prefer the selected variant's SKU; fall back to the product SKU.
                Render nothing when neither exists (avoids a blank "SKU:"). */}
            {(selectedVariant?.sku || product?.sku) && (
              <span className="font-sans text-[12px] text-mist">SKU: <span className="text-steel">{selectedVariant?.sku || product?.sku}</span></span>
            )}
            {(product.categoryName || product.category) && (
              <span className="font-sans text-[12px] text-mist capitalize">{product.categoryName || product.category}</span>
            )}
          </div>

          {product.description && (
            <div>
              <p className="font-sans text-sm text-steel leading-relaxed whitespace-pre-line line-clamp-4">{product.description}</p>
              {product.description.length > 160 && (
                <button
                  type="button"
                  onClick={scrollToAbout}
                  className="mt-1.5 font-sans text-[12px] font-semibold text-gold hover:opacity-80 transition-opacity underline underline-offset-2"
                >
                  Read more
                </button>
              )}
            </div>
          )}

          {/* Selectable attributes + variants (dynamic). The whole panel scrolls
              inside a fixed height so the Add to Cart CTA stays in view; the
              variant chips additionally keep their own inner scroll — mirrors the
              Kich product page's nested-scroll behaviour. */}
          {(attributeGroups.length > 0 || variants.length > 0) && (
            <div className="border-y border-cloud">
              <div className="attr-scroll flex flex-col divide-y divide-cloud max-h-[336px] overflow-y-auto pr-2">
                {/* Available Variants — selectable cards (name + price), shown
                    inside the attributes panel with their own inner scroll.
                    Selecting one swaps the gallery images, price, SKU, stock and
                    the cart variant. */}
                {variants.length > 0 && (
                  <div className="flex flex-col gap-3 py-4">
                    <span className="font-sans text-[11px] tracking-widest uppercase text-steel">Available Variants</span>
                    <VariantCards
                      items={variants.map((v) => ({
                        id: v.id,
                        name: v.label,
                        price: v.price,
                        image: v.images?.[0] || product.image,
                        soldOut: !v.inStock,
                      }))}
                      selectedId={selectedVariant?.id}
                      onSelect={(id) => {
                        // Clicking the already-selected variant deselects it.
                        const v = variants.find((x) => x.id === id);
                        const nextGallery = (v?.images?.length ? v.images : product.gallery) || [];
                        const nextMedia = nextGallery[0] || product.image;
                        // Only show the skeleton if the main image will actually change.
                        if (nextMedia !== activeMedia) setImgLoading(true);
                        setSelectedAttrs(s => ({ ...s, Options: v ? v.label : undefined }));
                        setActiveImg(0);
                      }}
                      formatPrice={usd2}
                      theme={VARIANT_THEME}
                    />
                    {/* {selectedVariant && (
                      <div className="flex flex-col gap-1.5">
                        {selectedVariant.sku && (
                          <p className="font-sans text-[13px] text-steel">
                            SKU: <span className="text-ink font-medium">{selectedVariant.sku}</span>
                          </p>
                        )}
                        {selectedVariant.stockQuantity != null && (
                          selectedVariant.inStock ? (
                            <p className="font-sans text-[13px] font-medium text-green-700">
                              In Stock: {selectedVariant.stockQuantity}{selectedVariant.stockQuantity <= 5 ? ' (Hurry up!)' : ''}
                            </p>
                          ) : (
                            <p className="font-sans text-[13px] font-medium text-red-600">Out of stock</p>
                          )
                        )}
                      </div>
                    )} */}
                  </div>
                )}
                {attributeGroups.map((g) => (
                  <div key={g.name} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-4">
                    <span className="font-sans text-[11px] tracking-widest uppercase text-steel sm:w-36 shrink-0 sm:pt-2">{g.name}</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {g.options.map((opt) => {
                        const active = selectedAttrs[g.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => selectAttr(g.name, opt)}
                            aria-pressed={active}
                            className={`px-4 py-2 rounded-full border text-[12px] font-sans transition-all ${
                              active
                                ? 'border-gold text-gold bg-gold/5'
                                : 'border-cloud text-steel hover:border-steel'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-sans text-[10px] tracking-widest uppercase text-steel">Qty</span>
            <div className="flex items-center border border-cloud bg-white">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-steel hover:text-ink hover:bg-bone transition-colors" aria-label="Decrease">−</button>
              <span className="w-10 h-10 flex items-center justify-center font-sans text-sm text-ink">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-steel hover:text-ink hover:bg-bone transition-colors" aria-label="Increase">+</button>
            </div>
          </div>

          {/* CTAs — wishlist stays on the same line as Add to Cart, including
              on small screens (no stacking). */}
          <div className="flex flex-row gap-3">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding || cartLoading}
              loading={isAdding}
              size="lg"
            >
              {product.inStock ? 'Add to Cart & Checkout' : 'Sold Out'}
            </Button>
            <button
              onClick={() => toggle(product.id)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className="w-14 h-14 border border-cloud bg-bone flex items-center justify-center hover:border-gold transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#CA8A04' : 'none'} aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={wishlisted ? '#CA8A04' : '#9695A1'} strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          {!product.inStock && (
            <NotifyMe productId={product.id} submitNotify={notifyBackInStock} style={{ ...EXTRAS_THEME, marginTop: 0 }} />
          )}

          <div className={extrasStyles.utilityRow} style={{ ...EXTRAS_THEME, marginTop: 0 }}>
            <ShareButton title={product.title} />
          </div>

          {/* Secure-checkout notice — checkout is handled by EVOKE Marketplace */}
          <p className="font-sans text-[11px] text-mist leading-relaxed -mt-2 flex items-start gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" stroke="#9695A1" strokeWidth="1.5"/>
              <path d="M8 10V7a4 4 0 018 0v3" stroke="#9695A1" strokeWidth="1.5"/>
            </svg>
            <span>
              All checkout and payment processing are securely completed through{' '}
              <a href={EVOKE_SITE} target="_blank" rel="noopener noreferrer" className="text-steel underline underline-offset-2 hover:text-gold transition-colors">EVOKE Marketplace</a>.
            </span>
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-y border-cloud">
            {[
              { icon: '🔒', label: 'Secure Checkout' },
              { icon: '✓', label: 'Certificate of Auth.' },
              { icon: '🚚', label: 'Free Shipping' },
              { icon: '↩', label: '30-Day Returns' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg">{b.icon}</span>
                <span className="font-sans text-[9px] tracking-wide uppercase text-steel">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={tabsRef} className="scroll-mt-24">
        <ProductTabs
          product={product}
          shipping={shippingContent}
          returns={returnsContent}
        />
      </div>

      {/* Lifestyle / editorial imagery — a horizontal strip, kept separate from
          the technical gallery and shown just above the related products. */}
      {lifestyleImages.length > 0 && (
        <div className="mt-16 lg:mt-20">
          <div className="flex items-end justify-between mb-6 gap-4">
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-light uppercase tracking-wider">Lifestyle</h2>
            {/* Slider arrows — only when there are more images than fit (4). */}
            {lifestyleImages.length > 4 && (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollLifestyle(-1)}
                  aria-label="Previous lifestyle images"
                  className="w-9 h-9 rounded-full border border-cloud flex items-center justify-center text-steel hover:border-gold hover:text-gold transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollLifestyle(1)}
                  aria-label="Next lifestyle images"
                  className="w-9 h-9 rounded-full border border-cloud flex items-center justify-center text-steel hover:border-gold hover:text-gold transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Sliding strip: 4 visible on desktop, 2 on mobile; swipe / arrows to slide. */}
          <div
            ref={lifestyleRef}
            className="no-scrollbar flex gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
          >
            {lifestyleImages.map((src, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[42%] sm:w-[calc(25%-12px)] overflow-hidden bg-bone aspect-[4/5] cursor-zoom-in"
                role="button"
                tabIndex={0}
                aria-label={`Zoom lifestyle image ${i + 1}`}
                onClick={() => openLifestyleZoom(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLifestyleZoom(i);
                  }
                }}
              >
                <img
                  src={src}
                  alt={`${product.title} lifestyle ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile-only swipe affordance (desktop has arrow buttons). */}
          {lifestyleImages.length > 2 && (
            <div className="sm:hidden flex items-center justify-center gap-2 mt-3 text-mist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-sans text-[11px] tracking-widest uppercase">Swipe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <SectionHeader eyebrow="You May Also Like" title="Related Timepieces" align="left" className="mb-10" />
          <ProductGrid products={related} columns={4} />
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-20">
          <SectionHeader eyebrow="Your History" title="Recently Viewed" align="left" className="mb-10" />
          <ProductGrid products={recentlyViewed} columns={4} />
        </div>
      )}

      {lifestyleZoom.FullscreenViewer}

      <style dangerouslySetInnerHTML={{ __html: `
        .shared-zoom-panel {
          transition: opacity 0.15s ease;
        }
        .attr-scroll { scrollbar-width: thin; scrollbar-color: #C9A84C transparent; }
        .attr-scroll::-webkit-scrollbar { width: 5px; }
        .attr-scroll::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 9999px; }
        .attr-scroll::-webkit-scrollbar-track { background: transparent; }
        .thumb-scroll { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
        .thumb-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
        @media (max-width: 1400px) {
          .shared-zoom-panel {
            left: 46%;
            width: 450px;
            height: 450px;
          }
        }
        @media (max-width: 1200px) {
          .shared-zoom-panel {
            width: 400px;
            height: 400px;
          }
        }
        @media (max-width: 1024px) {
          .shared-zoom-panel {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
