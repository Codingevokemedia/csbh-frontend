export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-sans font-semibold tracking-widest uppercase transition-all duration-300 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]';

  const sizes = {
    sm: 'text-[10px] px-5 py-2.5 min-h-[36px]',
    md: 'text-[11px] px-7 py-3.5 min-h-[44px]',
    lg: 'text-[12px] px-9 py-4 min-h-[52px]',
  };

  const variants = {
    // Light background — outline black, fills black on hover
    primary: 'border border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
    outline: 'border border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
    ghost:   'text-ink underline-offset-4 hover:underline min-h-[auto] px-0 py-0',
    // Dark background — outline white, fills white on hover
    'on-dark': 'border border-white text-white bg-transparent hover:bg-white hover:text-ink',
    // Utility
    dark:  'border border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
    light: 'border border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
  };

  return (
    <Tag
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </Tag>
  );
}
