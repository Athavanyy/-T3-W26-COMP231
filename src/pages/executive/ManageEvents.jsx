import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockEvents } from '../../services/mockApi.js';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        setError(`${err.message}. Showing prototype events.`);
        setEvents(mockEvents);
      }
    }
    loadEvents();
  }, []);

  return (
    <WireframePage
      url="https://ccms.edu/executive/events"
      title="Club Executive Event Management"
      subtitle="Open event management to access event functions."
      searchPlaceholder="Search Events"
    >
      <StatusMessage type="error">{error}</StatusMessage>
      <section className="wire-grid three">
        {events.slice(0, 3).map((eventItem) => (
          <article className="wire-card" key={eventItem.id || eventItem._id}>
            <div>
              <h2>{eventItem.title}</h2>
              <p>{eventItem.date}</p>
              <p>{eventItem.location}</p>
            </div>
            <div className="form-actions">
              <Link className="wire-button" to={`/executive/events/${eventItem.id || eventItem._id}/publish`}>Publish</Link>
              <button type="button">Delete</button>
            </div>
          </article>
        ))}
      </section>
    </WireframePage>
  );
}
