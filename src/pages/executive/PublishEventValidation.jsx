import { useState } from 'react';
import { useParams } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function PublishEventValidation() {
  const { eventId } = useParams();
  const [form, setForm] = useState({ title: 'Campus Tech Meetup', date: '2026-07-20', location: 'Progress Campus A-201', description: 'Networking and project demo event.' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function validate() {
    if (!form.title.trim()) return 'Event title is required.';
    if (!form.date) return 'Event date is required.';
    if (!form.location.trim()) return 'Event location is required.';
    if (form.description.trim().length < 10) return 'Event description must be at least 10 characters.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await api.publishEvent(eventId, form);
      setMessage('Event validation passed and the event was published successfully.');
    } catch (err) {
      setMessage(`${err.message}. Local validation passed, but backend publish endpoint needs review.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage
      url={`https://ccms.edu/executive/events/${eventId}/edit`}
      title="Create / Edit Event"
      subtitle="Enter event details, then publish the completed event."
      searchPlaceholder="Search Events"
    >
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>Event Title<input name="title" value={form.title} onChange={updateField} /></label>
        <label>Event Date<input type="date" name="date" value={form.date} onChange={updateField} /></label>
        <label>Location<input name="location" value={form.location} onChange={updateField} /></label>
        <label>Description<textarea name="description" value={form.description} onChange={updateField} /></label>
        <button type="submit" disabled={submitting}>{submitting ? 'Publishing...' : 'Publish Event'}</button>
      </form>
      <StatusMessage type={message.includes('successfully') ? 'success' : 'error'}>{message}</StatusMessage>
    </WireframePage>
  );
}
