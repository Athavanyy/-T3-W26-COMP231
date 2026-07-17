import { useState } from 'react';
import { useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function ApproveClubValidation() {
  const { clubId } = useParams();
  const [approvalNote, setApprovalNote] = useState('Club information reviewed and approved.');
  const [confirmApproval, setConfirmApproval] = useState(true);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!confirmApproval) return 'You must confirm the club approval action.';
    if (!approvalNote.trim()) return 'Approval note is required.';
    if (approvalNote.trim().length < 8) return 'Approval note must be at least 8 characters.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }
    setSubmitting(true);
    try {
      await api.approveClub(clubId, { status: 'Approved', approvalNote });
      setStatus('Club approval validation passed and club was approved successfully.');
    } catch (err) {
      setStatus(`${err.message}. Local validation passed, but backend approve-club endpoint needs review.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage
      url={`https://ccms.edu/admin/clubs/${clubId}/approve`}
      title="Administrator Club Management"
      subtitle="View clubs, approve pending clubs, and update club status."
      searchPlaceholder="Search Clubs"
    >
      <table className="wire-table">
        <thead><tr><th>Club ID</th><th>Club Name</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>{clubId}</td><td>Computer Club</td><td>Pending</td><td>Approve</td></tr>
        </tbody>
      </table>
      <form className="form-panel" onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
        <label>Approval Note<textarea value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} /></label>
        <label className="checkbox-row">
          <input type="checkbox" checked={confirmApproval} onChange={(event) => setConfirmApproval(event.target.checked)} />
          Confirm club approval
        </label>
        <button disabled={submitting}>{submitting ? 'Approving...' : 'Approve Club'}</button>
      </form>
      <StatusMessage type={status.includes('successfully') ? 'success' : 'error'}>{status}</StatusMessage>
    </WireframePage>
  );
}
