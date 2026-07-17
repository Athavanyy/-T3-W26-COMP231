import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';

export default function ExecutiveDashboard() {
  return (
    <WireframePage
      url="https://ccms.edu/executive/dashboard"
      title="Club Executive Dashboard"
      subtitle="Access club-management functions."
      searchPlaceholder="Search Club Tools"
    >
      <section className="wire-grid four">
        <article className="wire-card">
          <h2>View Member List</h2>
          <p>See the club's active members.</p>
          <Link className="wire-button" to="/executive/members/list">Open</Link>
        </article>
        <article className="wire-card">
          <h2>Manage Members</h2>
          <p>Review members and requests.</p>
          <Link className="wire-button" to="/executive/members">Open</Link>
        </article>
        <article className="wire-card">
          <h2>Approve Join Requests</h2>
          <p>Approve student join requests so they become members.</p>
          <Link className="wire-button" to="/executive/join-requests">Open</Link>
        </article>
        <article className="wire-card">
          <h2>Manage Events</h2>
          <p>Create, publish, edit, or delete events.</p>
          <Link className="wire-button" to="/executive/events">Open</Link>
        </article>
        <article className="wire-card">
          <h2>Post Announcements</h2>
          <p>Prepare updates for students.</p>
          <Link className="wire-button" to="/executive/announcements">Open</Link>
        </article>
        <article className="wire-card">
          <h2>Event Registrations</h2>
          <p>View registered students.</p>
          <Link className="wire-button" to="/executive/events">Open</Link>
        </article>
      </section>
    </WireframePage>
  );
}
