import { useState } from 'react';
import ProductCard from './ProductCard.jsx';
import QuickViewModal from './QuickViewModal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { ProductGridSkeleton } from '../ui/LoadingState.jsx';
import ErrorState from '../ui/ErrorState.jsx';

export default function ProductGrid({ products, loading, error, onRetry, columns = 4 }) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4',
  }[columns] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4';

  if (loading) return <ProductGridSkeleton count={columns === 4 ? 8 : columns * 2} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!products?.length) return (
    <EmptyState
      title="No timepieces found"
      message="Try adjusting your filters or check back for new arrivals."
      actionLabel="View All"
      actionTo="/mens"
    />
  );

  return (
    <>
      <div className={`grid ${gridCols} gap-x-3 gap-y-5 sm:gap-4 md:gap-6`}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
