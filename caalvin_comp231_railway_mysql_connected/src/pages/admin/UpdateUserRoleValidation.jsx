import { useState } from 'react';
import { useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

const allowedRoles = ['Student', 'Club Executive', 'Administrator'];

export default function UpdateUserRoleValidation() {
  const { userId } = useParams();
  const [role, setRole] = useState('Student');
  const [reason, setReason] = useState('Role correction for release test bed.');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!allowedRoles.includes(role)) return 'Selected role is invalid.';
    if (!reason.trim()) return 'Reason for role update is required.';
    if (reason.trim().length < 8) return 'Reason must be at least 8 characters.';
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
      await api.updateUserRole(userId, { role, reason });
      setStatus('User role validation passed and role was updated successfully.');
    } catch (err) {
      setStatus(`${err.message}. Local validation passed, but backend update-role endpoint needs review.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage
      url={`https://ccms.edu/admin/users/${userId}/role`}
      title="Administrator User Management"
      subtitle="View users, update roles, and disable accounts."
      searchPlaceholder="Search Users"
    >
      <table className="wire-table">
        <thead><tr><th>User ID</th><th>Name</th><th>Current Role</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>{userId}</td><td>Test User</td><td>{role}</td><td>Active</td><td>Update Role</td></tr>
        </tbody>
      </table>
      <form className="form-panel" onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
        <label>New Role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {allowedRoles.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
        <button disabled={submitting}>{submitting ? 'Updating...' : 'Update Role'}</button>
      </form>
      <StatusMessage type={status.includes('successfully') ? 'success' : 'error'}>{status}</StatusMessage>
    </WireframePage>
  );
}
