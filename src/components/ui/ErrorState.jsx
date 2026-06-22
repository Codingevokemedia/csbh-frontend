import Button from './Button.jsx';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-4">
      <div className="w-12 h-12 rounded-full border border-gold/30 bg-bone flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl text-ink font-light">{title}</h3>
        <p className="font-sans text-sm text-steel max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
}
