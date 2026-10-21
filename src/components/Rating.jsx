export default function Rating({ value, reviews }) {
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5`}>
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
        />
      </svg>
      <strong>{value.toFixed(1)}</strong>
      {reviews !== undefined && <span className="muted">({reviews})</span>}
    </span>
  );
}
