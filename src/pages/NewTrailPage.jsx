import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrailForm from '../components/TrailForm';
import StatusMessage from '../components/StatusMessage';
import { createTrail, getRegions } from '../api/trailsApi';

export default function NewTrailPage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [regionsStatus, setRegionsStatus] = useState('loading');
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let ignore = false;
    getRegions()
      .then((list) => {
        if (ignore) return;
        setRegions(list);
        setRegionsStatus('success');
      })
      .catch(() => {
        if (!ignore) setRegionsStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(input) {
    setSubmitError(null);
    try {
      const created = await createTrail(input);
      navigate(`/trails/${created.id}`, { state: { created: true } });
    } catch (err) {
      setSubmitError(err.message);
      throw err; // let the form know it failed so it re-enables the button
    }
  }

  return (
    <section className="form-page">
      <header className="page-header">
        <h1>Add a new trail</h1>
        <p>Share a route you’ve hiked. Fields marked with errors must be fixed before publishing.</p>
      </header>

      {regionsStatus === 'loading' && <StatusMessage variant="loading" title="Preparing the form…" />}
      {regionsStatus === 'error' && (
        <StatusMessage variant="error" title="Couldn’t load regions">
          Refresh the page to try again.
        </StatusMessage>
      )}
      {regionsStatus === 'success' && (
        <TrailForm regions={regions} onSubmit={handleCreate} submitError={submitError} />
      )}
    </section>
  );
}
