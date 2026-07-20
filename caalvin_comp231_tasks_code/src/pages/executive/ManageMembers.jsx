import WireframePage from '../../components/WireframePage.jsx';
import { mockExecutiveMembers } from '../../services/mockApi.js';

export default function ManageMembers() {
  return (
    <WireframePage
      url="https://ccms.edu/executive/members"
      title="Manage Members"
      subtitle="Manage the executive team of the club."
      searchPlaceholder="Search Members"
    >
      <section className="table-panel">
        <table className="wire-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Member</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockExecutiveMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.position}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.joinDate}</td>
                <td>
                  <button type="button" className="wire-button wire-button--small">Edit</button>
                  <button type="button" className="wire-button wire-button--small">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button type="button" className="wire-button">Add Executive</button>
        </div>
      </section>
    </WireframePage>
  );
}