import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

function validateEventItem(eventItem) {
  const errors = [];
  if (!eventItem) {
    errors.push('event object is missing');
    return errors;
  }
  if (!eventItem.id && !eventItem._id) errors.push('event id');
  if (!eventItem.title?.trim()) errors.push('title');
  if (!eventItem.date?.trim()) errors.push('date');
  if (!eventItem.location?.trim()) errors.push('location');
  return errors;
}

export default function EditEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError('');
      setWarning('');

      try {
        const data = await api.getExecutiveEvents();
        const allEvents = Array.isArray(data) ? data : data.events || [];
        const draftEvents = allEvents.filter((eventItem) => eventItem.status === 'Draft');
        const validatedEvents = [];
        const invalidMessages = [];

        draftEvents.forEach((eventItem) => {
          const invalidFields = validateEventItem(eventItem);
          if (invalidFields.length) {
            invalidMessages.push(`${eventItem.id || eventItem._id || 'unknown'} missing ${invalidFields.join(', ')}`);
          } else {
            validatedEvents.push(eventItem);
          }
        });

        if (invalidMessages.length) {
          setWarning(`Some draft events were skipped because they are missing required fields: ${invalidMessages.join('; ')}`);
        }

        setEvents(validatedEvents);
      } catch (err) {
        setError(`${err.message}. Showing draft prototype events.`);
        setEvents([
          { id: 'event-001', title: 'AI Project Night', clubName: 'AI Club', date: '2026-07-18', location: 'Room B201', status: 'Draft' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <WireframePage
      url="https://ccms.edu/executive/events/edit"
      title="Edit Event"
      subtitle="Review and update draft events before publishing."
      searchPlaceholder="Search Draft Events"
    >
      {loading && <StatusMessage>Loading draft events…</StatusMessage>}
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {warning && <StatusMessage type="warning">{warning}</StatusMessage>}

      {!loading && events.length === 0 ? (
        <div className="page narrow">
          <h2>No draft events found</h2>
          <p>There are no draft events available to edit yet.</p>
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
                <p>{eventItem.clubName || 'Executive Event'}</p>
                <p>{eventItem.date}</p>
                <p>{eventItem.location}</p>
              </div>
              <div className="form-actions">
                <Link className="wire-button" to={`/executive/events/${eventItem.id || eventItem._id}/publish`}>Publish</Link>
                <button type="button">Edit</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </WireframePage>
  );
}
