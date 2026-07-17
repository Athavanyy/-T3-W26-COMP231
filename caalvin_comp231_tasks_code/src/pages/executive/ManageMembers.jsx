import WireframePage from '../../components/WireframePage.jsx';

const executiveMembers = [
  { id: 'm1', position: 'President', name: 'Avery Brooks', email: 'avery.brooks@ccms.edu', joinDate: '2024-01-15' },
  { id: 'm2', position: 'Vice President', name: 'Jordan Lee', email: 'jordan.lee@ccms.edu', joinDate: '2024-02-03' },
  { id: 'm3', position: 'Secretary', name: 'Sam Patel', email: 'sam.patel@ccms.edu', joinDate: '2024-03-12' },
  { id: 'm4', position: 'Treasurer', name: 'Taylor Reed', email: 'taylor.reed@ccms.edu', joinDate: '2024-04-08' }
];

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
            {executiveMembers.map((member) => (
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