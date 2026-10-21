import TrailCard from './TrailCard';

export default function TrailGrid({ trails }) {
  return (
    <div className="trail-grid">
      {trails.map((trail) => (
        // Stable key: the database id, never the array index.
        <TrailCard key={trail.id} trail={trail} />
      ))}
    </div>
  );
}

export function TrailGridSkeleton({ count = 6 }) {
  return (
    <div className="trail-grid" aria-busy="true" aria-label="Loading trails">
      {Array.from({ length: count }, (_, i) => (
        // Static placeholders that never reorder — index keys are safe here.
        <div key={i} className="trail-card skeleton">
          <div className="card-banner" />
          <div className="card-body">
            <div className="sk-line w40" />
            <div className="sk-line w80" />
            <div className="sk-line w60" />
          </div>
        </div>
      ))}
    </div>
  );
}
