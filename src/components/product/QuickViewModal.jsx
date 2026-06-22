import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext.jsx';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import Button from '../ui/Button.jsx';

export default function QuickViewModal({ product, onClose }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addAndRedirect, loading } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  if (!product) return null;

  const variant = selectedVariant || product.variants?.find(v => v.inStock) || product.variants?.[0];
  const wishlisted = isWishlisted(product.id);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(product.price);

  async function handleAddToCart() {
    if (isAdding) return;
    setIsAdding(true);
    await addAndRedirect({
      productId: product.id,
      variantId: variant?.id || product.id,
      quantity: 1,
      productTitle: product.title,
    });
    setIsAdding(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          className="relative z-10 bg-white border border-cloud w-full max-w-3xl max-h-[90svh] overflow-y-auto flex flex-col md:flex-row shadow-xl"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          role="dialog"
          aria-modal="true"
          aria-label={product.title}
        >
          {/* Image */}
          <div className="md:w-2/5 relative bg-bone">
            <img
              src={product.gallery?.[activeImg] || product.image}
              alt={product.title}
              className="w-full h-72 md:h-full object-cover"
            />
            {product.gallery?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-gold' : 'bg-cloud'}`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col gap-5">
            <button
              onClick={onClose}
              className="icon-btn absolute top-3 right-3 text-steel hover:text-ink"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div>
              <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-gold">
                {product.isLimitedEdition ? 'Limited Edition · ' : ''}{product.collection}
              </span>
              <h2 className="font-display text-3xl text-ink font-light mt-1">{product.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-sans text-xl font-semibold text-ink">{formatted}</span>
                {product.compareAtPrice && (
                  <span className="font-sans text-sm text-mist line-through">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="font-sans text-sm text-steel leading-relaxed line-clamp-3">{product.description}</p>

            {product.variants?.length > 1 && (
              <div>
                <span className="font-sans text-[10px] tracking-widest uppercase text-steel block mb-2">Select Option</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={!v.inStock}
                      className={`px-3 py-2 text-[10px] font-sans tracking-wide border transition-all duration-150 disabled:opacity-30 disabled:line-through ${
                        variant?.id === v.id
                          ? 'border-gold text-gold bg-gold/5'
                          : 'border-cloud text-steel hover:border-steel'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding || loading}
                  loading={isAdding}
                >
                  {product.inStock ? 'Add to Cart' : 'Sold Out'}
                </Button>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="w-12 h-12 border border-cloud flex items-center justify-center hover:border-gold transition-colors bg-bone"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#CA8A04' : 'none'} aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={wishlisted ? '#CA8A04' : '#9695A1'} strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="font-sans text-[10px] tracking-widest uppercase text-steel hover:text-ink text-center py-1 transition-colors"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
