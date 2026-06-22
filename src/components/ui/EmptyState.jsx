import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Check back soon for new arrivals.',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-4">
      <div className="w-12 h-12 rounded-full border border-cloud bg-bone flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="#9695A1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl text-ink font-light">{title}</h3>
        <p className="font-sans text-sm text-steel max-w-sm">{message}</p>
      </div>
      {actionLabel && (actionTo ? (
        <Button as={Link} to={actionTo} variant="outline" size="sm">{actionLabel}</Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onAction}>{actionLabel}</Button>
      ))}
    </div>
  );
}
