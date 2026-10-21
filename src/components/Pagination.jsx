// Builds e.g. [1, 'gap-left', 4, 5, 6, 'gap-right', 10]
function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (current <= 4) return [...range(1, 5), 'gap-right', total];
  if (current >= total - 3) return [1, 'gap-left', ...range(total - 4, total)];
  return [1, 'gap-left', current - 1, current, current + 1, 'gap-right', total];
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        ‹ Prev
      </button>
      {getPageItems(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="page-gap">
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={item === page ? 'active' : undefined}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
        Next ›
      </button>
    </nav>
  );
}
