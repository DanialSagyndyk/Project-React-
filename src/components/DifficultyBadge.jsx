import { capitalize } from '../utils/format';

export default function DifficultyBadge({ level }) {
  return <span className={`badge badge-${level}`}>{capitalize(level)}</span>;
}
