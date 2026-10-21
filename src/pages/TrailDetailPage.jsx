import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import DifficultyBadge from '../components/DifficultyBadge';
import Rating from '../components/Rating';
import StatusMessage from '../components/StatusMessage';
import { deleteTrail, getSimilarTrails, getTrail } from '../api/trailsApi';
import { formatDate, formatDistance, formatDuration, formatElevation } from '../utils/format';

/**
 * Route component. `key={id}` gives every trail its own TrailDetail instance:
 * when the user opens a similar trail (/trails/5 → /trails/9) all local state
 * (trail, status, delete confirmation) is reset instead of leaking between trails.
 */
export default function TrailDetailPage() {
  const { id } = useParams();
  return <TrailDetail key={id} id={id} />;
}

function TrailDetail({ id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = location.state?.created === true;

  const [trail, setTrail] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');

    getTrail(id)
      .then((result) => {
        if (ignore) return;
        setTrail(result);
        setStatus('success');
      })
      .catch((err) => {
        if (ignore) return;
        setError(err);
        setStatus('error');
      });

    getSimilarTrails(id).then((list) => {
      if (!ignore) setSimilar(list);
    });

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrail(id);
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  if (status === 'loading') {
    return <StatusMessage variant="loading" title="Loading trail…" />;
  }

  if (status === 'error') {
    return (
      <StatusMessage
        variant={error.status === 404 ? 'empty' : 'error'}
        title={error.status === 404 ? 'Trail not found' : 'Something went wrong'}
        action={
          <Link to="/" className="btn">
            Back to all trails
          </Link>
        }
      >
        {error.message}
      </StatusMessage>
    );
  }

  return (
    <article className="detail">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {justCreated && (
        <div className="notice notice-success" role="status">
          Trail published! It now appears in the list.
        </div>
      )}

      <header className={`detail-hero banner-${trail.difficulty}`}>
        <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 L35 22 L60 40 L100 5 L140 38 L170 20 L200 42 L200 60 Z" />
        </svg>
        <div className="detail-hero-text">
          <span className="detail-region">{trail.region}</span>
          <h1>{trail.name}</h1>
          <div className="detail-meta">
            <DifficultyBadge level={trail.difficulty} />
            <Rating value={trail.rating} reviews={trail.reviews} />
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="stat-grid">
            <Stat label="Distance" value={formatDistance(trail.distanceKm)} />
            <Stat label="Elevation gain" value={formatElevation(trail.elevationGain)} />
            <Stat label="Max altitude" value={formatElevation(trail.maxAltitude)} />
            <Stat label="Duration" value={formatDuration(trail.durationHours)} />
          </section>

          <section className="detail-section">
            <h2>About this trail</h2>
            <p>{trail.description}</p>
          </section>

          <section className="detail-section">
            <h2>Good to know</h2>
            <ul className="facts">
              <li>
                <span>Best season</span>
                <strong>{trail.season}</strong>
              </li>
              <li>
                <span>Added by</span>
                <strong>{trail.author}</strong>
              </li>
              <li>
                <span>Added on</span>
                <strong>{formatDate(trail.createdAt)}</strong>
              </li>
            </ul>
            {trail.tags.length > 0 && (
              <div className="tags">
                {trail.tags.map((tag) => (
                  <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`} className="tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="danger-zone">
            {!confirmingDelete ? (
              <button type="button" className="btn btn-ghost btn-danger" onClick={() => setConfirmingDelete(true)}>
                Delete trail
              </button>
            ) : (
              <div className="confirm">
                <span>Delete “{trail.name}”? This can’t be undone.</span>
                <div className="confirm-actions">
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteError && <p className="field-error">{deleteError}</p>}
          </section>
        </div>

        <aside className="detail-aside">
          <h2>More in {trail.region}</h2>
          {similar.length === 0 ? (
            <p className="muted">No other trails in this region yet.</p>
          ) : (
            <ul className="similar-list">
              {similar.map((s) => (
                <li key={s.id}>
                  <Link to={`/trails/${s.id}`}>
                    <span className="similar-name">{s.name}</span>
                    <span className="similar-meta">
                      <DifficultyBadge level={s.difficulty} /> {formatDistance(s.distanceKm)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
