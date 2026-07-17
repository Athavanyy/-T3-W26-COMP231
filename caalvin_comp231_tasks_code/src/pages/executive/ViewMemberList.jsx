import WireframePage from '../../components/WireframePage.jsx';

const activeMembers = [
  { id: 'v1', position: 'President', name: 'Avery Brooks', email: 'avery.brooks@ccms.edu', joinDate: '2024-01-15' },
  { id: 'v2', position: 'Vice President', name: 'Jordan Lee', email: 'jordan.lee@ccms.edu', joinDate: '2024-02-03' },
  { id: 'v3', position: 'Secretary', name: 'Sam Patel', email: 'sam.patel@ccms.edu', joinDate: '2024-03-12' },
  { id: 'v4', position: 'Treasurer', name: 'Taylor Reed', email: 'taylor.reed@ccms.edu', joinDate: '2024-04-08' }
];

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
            {activeMembers.map((member) => (
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
