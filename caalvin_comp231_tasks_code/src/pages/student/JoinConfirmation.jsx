import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function JoinConfirmation() {
  const { requestId: rawRequestId } = useParams();
  const requestId = (rawRequestId || '').trim();
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfirmation() {
      if (!requestId) {
        setValidationError('Join request ID is missing or invalid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setValidationError('');

      try {
        const data = await api.getJoinConfirmation(requestId);
        const confirmationData = data.confirmation || data;

        if (!confirmationData || !confirmationData.id) {
          throw new Error('Confirmation data is incomplete or invalid.');
        }

        setConfirmation({
          requestId: confirmationData.id,
          status: confirmationData.status || 'Submitted',
          message: confirmationData.message || `Your join request for ${confirmationData.club ?? 'the club'} was recorded.`
        });
      } catch (err) {
        const message = err.message || 'Unable to load join request confirmation.';
        setError(`${message} Showing prototype confirmation.`);
        setConfirmation({
          requestId,
          status: 'Submitted',
          message: 'Your join request was recorded.'
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfirmation();
  }, [requestId]);

  return (
    <WireframePage
      url="https://ccms.edu/clubs/join/confirmation"
      title="Join Club Confirmation"
      subtitle="The request has been sent to the Club Executive."
      searchPlaceholder="Search Clubs"
    >
      {loading && <StatusMessage>Loading join request confirmation…</StatusMessage>}
      {validationError && <StatusMessage type="error">{validationError}</StatusMessage>}
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {confirmation && (
        <>
          <section className="flow-row">
            <div className="flow-box arrow">Submit Join Request</div>
            <div className="flow-box arrow">Request Stored</div>
            <div className="flow-box">
              Confirmation Displayed
              <br />
              {confirmation.requestId}
            </div>
          </section>
          <StatusMessage type="success">{confirmation.message}</StatusMessage>
          <div className="flow-row">
            <strong>Status:</strong> {confirmation.status}
          </div>
        </>
      )}
      {!loading && !confirmation && !validationError && !error && (
        <StatusMessage type="warning">
          No confirmation was returned. Please verify your join request and try again.
        </StatusMessage>
      )}
      <div className="flow-row">
        <Link className="wire-button" to="/student/clubs">Back to Clubs</Link>
      </div>
    </WireframePage>
  );
}
