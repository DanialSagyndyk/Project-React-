import { Link } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';
import Rating from './Rating';
import { formatDistance, formatDuration, formatElevation } from '../utils/format';

export default function TrailCard({ trail }) {
  return (
    <article className="trail-card">
      <Link to={`/trails/${trail.id}`} className="card-link">
        <div className={`card-banner banner-${trail.difficulty}`}>
          <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 60 L45 18 L75 42 L110 8 L150 40 L175 25 L200 45 L200 60 Z" />
          </svg>
          <span className="card-region">{trail.region}</span>
        </div>
        <div className="card-body">
          <div className="card-top">
            <DifficultyBadge level={trail.difficulty} />
            <Rating value={trail.rating} reviews={trail.reviews} />
          </div>
          <h3 className="card-title">{trail.name}</h3>
          <dl className="card-stats">
            <div>
              <dt>Distance</dt>
              <dd>{formatDistance(trail.distanceKm)}</dd>
            </div>
            <div>
              <dt>Climb</dt>
              <dd>{formatElevation(trail.elevationGain)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatDuration(trail.durationHours)}</dd>
            </div>
          </dl>
        </div>
      </Link>
    </article>
  );
}
