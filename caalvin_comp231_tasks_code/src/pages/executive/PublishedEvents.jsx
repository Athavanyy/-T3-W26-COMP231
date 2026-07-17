import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function PublishedEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getExecutiveEvents();
        const allEvents = Array.isArray(data) ? data : data.events || [];
        setEvents(allEvents.filter((eventItem) => eventItem.status === 'Published'));
      } catch (err) {
        setError(`${err.message}. Showing published prototype events.`);
        setEvents([
          { id: 'event-002', title: 'Cybersecurity Workshop', clubName: 'Cybersecurity Club', date: '2026-07-20', location: 'Lab C104', status: 'Published' }
        ]);
      }
    }
    loadEvents();
  }, []);

  return (
    <WireframePage
      url="https://ccms.edu/executive/events/published"
      title="Published Events"
      subtitle="View events that have already been published to students."
      searchPlaceholder="Search Published Events"
    >
      <StatusMessage type={error ? 'error' : undefined}>{error}</StatusMessage>

      {events.length === 0 ? (
        <div className="page narrow">
          <h2>No published events found</h2>
          <p>There are no published events available yet.</p>
          <div className="flow-row">
            <Link className="wire-button" to="/executive/events/create">Create New Event</Link>
          </div>
        </div>
      ) : (
        <section className="wire-grid three">
          {events.map((eventItem) => (
            <article className="wire-card" key={eventItem.id || eventItem._id}>
              <div>
                <h2>{eventItem.title}</h2>
                <p>{eventItem.clubName}</p>
                <p>{eventItem.date}</p>
                <p>{eventItem.location}</p>
                <p>Status: {eventItem.status}</p>
              </div>
              <div className="form-actions">
                <button type="button">View Details</button>
                <button type="button">Archive</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </WireframePage>
  );
}
