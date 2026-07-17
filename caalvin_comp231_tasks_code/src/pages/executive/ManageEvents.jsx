import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';

export default function ManageEvents() {
  return (
    <WireframePage
      url="https://ccms.edu/executive/events"
      title="Club Executive Event Management"
      subtitle="Open event management to access event functions."
      searchPlaceholder="Search Events"
    >
      <section className="wire-grid three">
        <article className="wire-card">
          <div>
            <h2>Create Event</h2>
            <p>Start a new event and enter details before publishing it.</p>
          </div>
          <div className="form-actions">
            <Link className="wire-button" to="/executive/events/create">Open</Link>
          </div>
        </article>
        <article className="wire-card">
          <div>
            <h2>Edit Event</h2>
            <p>Update draft event details before they are published.</p>
          </div>
          <div className="form-actions">
            <Link className="wire-button" to="/executive/events/edit">Open</Link>
          </div>
        </article>
        <article className="wire-card">
          <div>
            <h2>Published Events</h2>
            <p>Review events that are already published and visible to students.</p>
          </div>
          <div className="form-actions">
            <Link className="wire-button" to="/executive/events/published">Open</Link>
          </div>
        </article>
      </section>
    </WireframePage>
  );
}
