export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-[3/4] w-full rounded-sm" />
      <div className="skeleton h-4 w-3/4 rounded-sm" />
      <div className="skeleton h-3 w-1/2 rounded-sm" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function LoadingState({ message = 'Loading…', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] gap-6">
        <GoldSpinner />
        <p className="font-sans text-xs tracking-widest uppercase text-steel">{message}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16 gap-4">
      <GoldSpinner size={24} />
      <span className="font-sans text-xs tracking-widest uppercase text-steel">{message}</span>
    </div>
  );
}

function GoldSpinner({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="#E0DFDB" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
