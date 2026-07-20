import { useState } from 'react';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { mockJoinRequests } from '../../services/mockApi.js';

export default function ApproveJoinRequest() {
  const [requests, setRequests] = useState(mockJoinRequests);
  const [message, setMessage] = useState('');

  function handleApprove(id) {
    setRequests((current) => current.map((request) => (
      request.id === id
        ? { ...request, status: 'Approved' }
        : request
    )));
    const approved = requests.find((request) => request.id === id);
    setMessage(`Join request for ${approved?.student ?? 'student'} approved.`);
  }

  function handleReject(id) {
    setRequests((current) => current.map((request) => (
      request.id === id
        ? { ...request, status: 'Rejected' }
        : request
    )));
    const rejected = requests.find((request) => request.id === id);
    setMessage(`Join request for ${rejected?.student ?? 'student'} rejected.`);
  }

  return (
    <WireframePage
      url="https://ccms.edu/executive/join-requests"
      title="Approve Join Request"
      subtitle="Approve student join requests so they can become members."
      searchPlaceholder="Search Requests"
    >
      <StatusMessage type={message ? 'success' : undefined}>{message}</StatusMessage>
      <section className="table-panel">
        <table className="wire-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Club</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.student}</td>
                <td>{request.email}</td>
                <td>{request.club}</td>
                <td>{request.status}</td>
                <td>{request.requestDate}</td>
                <td>
                  <button
                    type="button"
                    className="wire-button wire-button--small"
                    onClick={() => handleApprove(request.id)}
                    disabled={request.status !== 'Pending'}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="wire-button wire-button--small"
                    onClick={() => handleReject(request.id)}
                    disabled={request.status !== 'Pending'}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </WireframePage>
  );
}
