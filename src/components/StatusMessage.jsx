/**
 * One component for the non-success UI states.
 * variant: 'loading' | 'error' | 'empty'
 */
export default function StatusMessage({ variant, title, children, action }) {
  return (
    <div className={`status status-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {variant === 'loading' ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <span className="status-icon" aria-hidden="true">
          {variant === 'error' ? '!' : '?'}
        </span>
      )}
      {title && <h3>{title}</h3>}
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
