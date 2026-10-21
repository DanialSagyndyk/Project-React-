import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltersBar from '../components/FiltersBar';
import TrailGrid, { TrailGridSkeleton } from '../components/TrailGrid';
import Pagination from '../components/Pagination';
import StatusMessage from '../components/StatusMessage';
import { getRegions, getTrails, resetDatabase } from '../api/trailsApi';

const PAGE_SIZE = 12;
const DEFAULT_SORT = 'rating-desc';

export default function TrailsPage() {
  // Filters live in the URL (?q=&region=&difficulty=&sort=&page=), so they survive
  // going to a detail page and pressing Back, and a filtered list can be shared by link.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const region = searchParams.get('region') ?? '';
  const difficulty = searchParams.get('difficulty') ?? '';
  const sort = searchParams.get('sort') ?? DEFAULT_SORT;
  const page = Number(searchParams.get('page')) || 1;

  // Server data + request status
  const [data, setData] = useState(null); // { items, total, page, totalPages }
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0); // bump → refetch (Retry / restore)
  const [regions, setRegions] = useState([]);
  const [resetKey, setResetKey] = useState(0); // bump → remount SearchBar

  // Main data effect. Re-runs whenever any filter changes.
  useEffect(() => {
    let ignore = false; // protects against race conditions / stale responses
    setStatus('loading');
    setError(null);

    getTrails({ q, region, difficulty, sort, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (ignore) return; // a newer request has started → drop this old answer
        setData(result);
        setStatus('success');
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message);
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [q, region, difficulty, sort, page, reloadToken]);

  // Region options for the filter (loaded once, and again after data is restored).
  useEffect(() => {
    let ignore = false;
    getRegions()
      .then((list) => {
        if (!ignore) setRegions(list);
      })
      .catch(() => {
        if (!ignore) setRegions([]);
      });
    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  // Merge a patch into the URL params. Changing any filter returns to page 1.
  const updateFilters = useCallback(
    (patch) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value === null || (key === 'sort' && value === DEFAULT_SORT)) next.delete(key);
          else next.set(key, String(value));
        });
        if (!('page' in patch)) next.delete('page');
        if (next.get('page') === '1') next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSearch = useCallback((value) => updateFilters({ q: value }), [updateFilters]);

  function handleReset() {
    setSearchParams({});
    setResetKey((k) => k + 1);
  }

  function handlePageChange(nextPage) {
    updateFilters({ page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleRestoreData() {
    await resetDatabase();
    handleReset();
    setReloadToken((t) => t + 1);
  }

  const hasActiveFilters = Boolean(q || region || difficulty || sort !== DEFAULT_SORT);
  const filters = { q, region, difficulty, sort };

  return (
    <>
      <section className="hero">
        <h1>Find your next trail around Almaty</h1>
        <p>Lakes, glaciers, canyons and quiet forest paths — filtered by what you’re ready for today.</p>
      </section>

      <FiltersBar
        filters={filters}
        regions={regions}
        onChange={updateFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        resetKey={resetKey}
        hasActiveFilters={hasActiveFilters}
      />

      {status === 'loading' && <TrailGridSkeleton count={PAGE_SIZE} />}

      {status === 'error' && (
        <StatusMessage
          variant="error"
          title="Couldn’t load trails"
          action={
            <button type="button" className="btn" onClick={() => setReloadToken((t) => t + 1)}>
              Try again
            </button>
          }
        >
          {error}
        </StatusMessage>
      )}

      {status === 'success' && data.total === 0 && (
        <StatusMessage
          variant="empty"
          title="No trails match your filters"
          action={
            hasActiveFilters ? (
              <button type="button" className="btn" onClick={handleReset}>
                Clear filters
              </button>
            ) : (
              <button type="button" className="btn" onClick={handleRestoreData}>
                Restore sample data
              </button>
            )
          }
        >
          {q ? `Nothing found for “${q}”. ` : ''}Try a different region or difficulty.
        </StatusMessage>
      )}

      {status === 'success' && data.total > 0 && (
        <>
          <p className="results-meta">
            Showing {(data.page - 1) * PAGE_SIZE + 1}–{(data.page - 1) * PAGE_SIZE + data.items.length} of{' '}
            <strong>{data.total}</strong> trails
          </p>
          <TrailGrid trails={data.items} />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}
