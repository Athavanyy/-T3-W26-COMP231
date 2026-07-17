import { useEffect, useState } from 'react';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockClubs } from '../../services/mockApi.js';

export default function ApproveClub() {
  const [clubs, setClubs] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await api.getClubs();
        const fetchedClubs = Array.isArray(data) ? data : data.clubs || [];
        setClubs(fetchedClubs);
      } catch (err) {
        setStatus(`${err.message}. Showing prototype clubs.`);
        setClubs(mockClubs);
      } finally {
        setLoading(false);
      }
    }
    loadClubs();
  }, []);

  const pendingClubs = clubs.filter((club) => club.status === 'Pending Approval');

  async function handleApprove(clubId) {
    try {
      await api.approveClub(clubId, { status: 'Approved' });
      setClubs((current) => current.map((club) => (
        club.id === clubId ? { ...club, status: 'Approved' } : club
      )));
      setStatus('Club approved and now active.');
    } catch (err) {
      setStatus(`${err.message}. Approval is simulated locally.`);
      setClubs((current) => current.map((club) => (
        club.id === clubId ? { ...club, status: 'Approved' } : club
      )));
    }
  }

  return (
    <WireframePage
      url="https://ccms.edu/admin/clubs/approve"
      title="Approve Clubs"
      subtitle="Review pending clubs and approve them to make them active."
      searchPlaceholder="Search Clubs"
    >
      <StatusMessage type={status.includes('approved') ? 'success' : 'error'}>{status}</StatusMessage>

      {loading ? (
        <p>Loading clubs...</p>
      ) : pendingClubs.length === 0 ? (
        <div className="page narrow">
          <h2>No pending clubs</h2>
          <p>There are no clubs pending approval at this time.</p>
        </div>
      ) : (
        <table className="wire-table">
          <thead>
            <tr>
              <th>Club Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingClubs.map((club) => (
              <tr key={club.id}>
                <td>{club.name}</td>
                <td>{club.category}</td>
                <td>{club.description}</td>
                <td>{club.status}</td>
                <td>
                  <button type="button" onClick={() => handleApprove(club.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </WireframePage>
  );
}
