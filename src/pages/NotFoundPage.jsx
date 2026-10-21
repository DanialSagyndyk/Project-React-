import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';

export default function NotFoundPage() {
  return (
    <StatusMessage
      variant="empty"
      title="Page not found"
      action={
        <Link to="/" className="btn">
          Go to trails
        </Link>
      }
    >
      This path doesn’t lead anywhere — let’s get you back on the trail.
    </StatusMessage>
  );
}
