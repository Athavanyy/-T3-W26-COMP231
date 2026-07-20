import WireframePage from '../../components/WireframePage.jsx';
import { mockExecutiveMembers } from '../../services/mockApi.js';

export default function ViewMemberList() {
  return (
    <WireframePage
      url="https://ccms.edu/executive/members/list"
      title="View Member List"
      subtitle="View the club's active members."
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
            </tr>
          </thead>
          <tbody>
            {mockExecutiveMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.position}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </WireframePage>
  );
}
