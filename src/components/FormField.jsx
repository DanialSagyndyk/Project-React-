/** Label + control + hint/error wrapper for the add-trail form. */
export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}
