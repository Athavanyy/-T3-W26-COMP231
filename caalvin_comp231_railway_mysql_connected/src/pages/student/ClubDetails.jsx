import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockClubs } from '../../services/mockApi.js';

export default function ClubDetails() {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClub() {
      try {
        const data = await api.getClubById(clubId);
        setClub(data.club || data);
      } catch (err) {
        setError(`${err.message}. Showing prototype test data.`);
        setClub(mockClubs.find((item) => item.id === clubId) || mockClubs[0]);
      } finally {
        setLoading(false);
      }
    }
    loadClub();
  }, [clubId]);

  async function handleAddMembers(event) {
    event.preventDefault();
    setSubmitStatus('');
    setSubmitting(true);

    try {
      const result = await api.addClubMembers(clubId, { count: Number(memberCount) });
      setSubmitStatus(`Added ${result.added} member(s). Total members now ${result.totalMembers}.`);
      setClub((prev) => (prev ? { ...prev, members: result.totalMembers } : prev));
    } catch (err) {
      setSubmitStatus(err.message || 'Unable to add members.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage
      url={`https://ccms.edu/clubs/${clubId}`}
      title="Club Details"
      subtitle="Review club information before joining."
      searchPlaceholder="Search Clubs"
    >
      <StatusMessage type="error">{error}</StatusMessage>
      {loading && <StatusMessage>Loading club details...</StatusMessage>}
      {club && (
        <section className="wire-grid two center">
          <article className="wire-card">
            <div>
              <h2>{club.name}</h2>
              <p>{club.description}</p>
              <p>Category: {club.category || 'General'}</p>
              <p>Meeting: Room A201</p>
              <p>Status: Open to Join</p>
            </div>
            <Link className="wire-button" to="/student/join-confirmation/test-request-001">Join</Link>
          </article>
          <article className="wire-card">
            <div>
              <h2>Selected Club</h2>
              <p>{club.name}</p>
              <p>{club.members ?? 'N/A'} members</p>
              <p>Executive: club@ccms.edu</p>
            </div>
            <form onSubmit={handleAddMembers} className="flow-row">
              <label>
                Add members:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={memberCount}
                  onChange={(event) => setMemberCount(Number(event.target.value))}
                />
              </label>
              <button className="wire-button" type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Members'}
              </button>
            </form>
            {submitStatus && <StatusMessage type="success">{submitStatus}</StatusMessage>}
            <Link className="wire-button" to="/student/clubs">Back</Link>
          </article>
        </section>
      )}
    </WireframePage>
  );
}
