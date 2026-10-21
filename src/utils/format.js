export const formatDistance = (km) => `${km.toLocaleString('en-US', { maximumFractionDigits: 1 })} km`;
export const formatElevation = (m) => `${m.toLocaleString('en-US')} m`;

export function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
