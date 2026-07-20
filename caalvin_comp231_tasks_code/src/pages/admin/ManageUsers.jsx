import WireframePage from '../../components/WireframePage.jsx';
import { mockManageUsers } from '../../services/mockApi.js';

export default function ManageUsers() {
  return (
    <WireframePage
      url="https://ccms.edu/admin/users/manage"
      title="User Management"
      subtitle="View and manage system users."
      searchPlaceholder="Search Users"
    >
      <table className="wire-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockManageUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <button type="button">Edit</button>
                <button type="button">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flow-row" style={{ marginTop: '16px' }}>
        <button type="button" className="wire-button">Add User</button>
      </div>
    </WireframePage>
  );
}
