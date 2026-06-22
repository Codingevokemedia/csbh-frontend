import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';

export default function ProductCard({ product, onQuickView }) {
  const { isWishlisted, toggle } = useWishlist();
  const { addAndRedirect, loading } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(product.price);

  const compareFormatted = product.compareAtPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(product.compareAtPrice)
    : null;

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    const defaultVariant = product.variants?.find(v => v.inStock) || product.variants?.[0];
    await addAndRedirect({
      productId: product.id,
      variantId: defaultVariant?.id || product.id,
      quantity: 1,
      productTitle: product.title,
    });
    setIsAdding(false);
  }

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  }

  return (
    <motion.article
      className="group flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Link to={`/product/${product.slug}`} className="block" aria-label={product.title}>
        {/* Image */}
        <div className="relative aspect-square bg-bone overflow-hidden">
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-contain sm:object-cover p-2 sm:p-0 transition-transform duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${!product.inStock ? 'opacity-60' : ''}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />

          {/* Sold-out badge */}
          {!product.inStock && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-mist text-[8px] sm:text-[9px] font-sans font-bold tracking-widest uppercase px-2 py-1 shadow-sm">
              Sold Out
            </span>
          )}

          {/* Wishlist — desktop hover only */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center hidden sm:flex opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? '#CA8A04' : 'none'} aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={wishlisted ? '#CA8A04' : '#595667'} strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="pt-2 sm:pt-3.5 px-0.5 sm:px-1 flex flex-col gap-1 sm:gap-1.5">
          <h3 className="font-sans text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-ink leading-snug line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[11px] sm:text-[13px] font-semibold text-ink">{formatted}</span>
            {compareFormatted && (
              <span className="font-sans text-[10px] sm:text-xs text-mist line-through">{compareFormatted}</span>
            )}
          </div>
          {/* Availability — only show when meaningful (low stock / sold out) */}
          {product.inStock && product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="font-sans text-[9px] sm:text-[10px] text-gold tracking-wide">Only {product.stockQuantity} left</span>
          )}
        </div>
      </Link>

      {/* Add to Cart — desktop only */}
      <div className="hidden sm:block px-1 pt-3 pb-1 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding || loading}
          className="w-full py-3 border border-ink text-ink font-sans text-[10px] tracking-widest uppercase font-semibold hover:bg-ink hover:text-white active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
        >
          {isAdding ? 'Adding…' : product.inStock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </motion.article>
  );
}
