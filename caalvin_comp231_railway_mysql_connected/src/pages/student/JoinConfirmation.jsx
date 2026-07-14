import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function JoinConfirmation() {
  const { requestId = 'test-request-001' } = useParams();
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConfirmation() {
      try {
        const data = await api.getJoinConfirmation(requestId);
        setConfirmation(data.confirmation || data);
      } catch (err) {
        setError(`${err.message}. Showing prototype confirmation.`);
        setConfirmation({ requestId, status: 'Submitted', message: 'Your join request was recorded.' });
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
      <StatusMessage type="error">{error}</StatusMessage>
      {confirmation && (
        <>
          <section className="flow-row">
            <div className="flow-box arrow">Submit Join Request</div>
            <div className="flow-box arrow">Request Stored</div>
            <div className="flow-box">Confirmation Displayed<br />{confirmation.requestId}</div>
          </section>
          <StatusMessage type="success">{confirmation.message}</StatusMessage>
        </>
      )}
      <div className="flow-row"><Link className="wire-button" to="/student/clubs">Back to Clubs</Link></div>
    </WireframePage>
  );
}
