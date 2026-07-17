import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockEvents } from '../../services/mockApi.js';

export default function SelectEvent() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        setError(`${err.message}. Showing prototype test events.`);
        setEvents(mockEvents);
      }
    }
    loadEvents();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedEventId) {
      setMessage('Please select an event before continuing.');
      return;
    }
    const selectedEvent = events.find((item) => (item.id || item._id) === selectedEventId);
    setMessage(`Selected event: ${selectedEvent.title}. Registration is connected to this activity.`);
  }

  function handleRegistration() {
    if (!selectedEventId) {
      setMessage('Please select an event before continuing.');
      return;
    }

    navigate(`/student/events/register/${selectedEventId}`);
  }

  return (
    <WireframePage
      url="https://ccms.edu/events/details"
      title="Event Details"
      subtitle="Check the event date and location, then select the event."
      searchPlaceholder="Search Events"
    >
      <StatusMessage type="error">{error}</StatusMessage>
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>Selected Event
          <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
            <option value="">Select Event</option>
            {events.map((eventItem) => (
              <option key={eventItem.id || eventItem._id} value={eventItem.id || eventItem._id}>
                {eventItem.title} - {eventItem.date} - {eventItem.location}
              </option>
            ))}
          </select>
        </label>
        <div className="flow-row">
          <div className="flow-box">Date</div>
          <div className="flow-box">Location</div>
          <div
            className="flow-box"
            role="button"
            tabIndex={0}
            onClick={handleRegistration}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') handleRegistration();
            }}
          >
            Registration
          </div>
        </div>
        <button type="submit">Select Event</button>
      </form>
      <StatusMessage type={message.startsWith('Please') ? 'error' : 'success'}>{message}</StatusMessage>
    </WireframePage>
  );
}
