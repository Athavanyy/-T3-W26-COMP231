import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';

export default function EnterEventDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    club: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [message, setMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleCancel() {
    navigate(-1);
  }

  function handleSaveDraft(event) {
    event.preventDefault();
    setMessage('Event saved as draft.');
  }

  function handlePublish(event) {
    event.preventDefault();
    setMessage('Event published successfully.');
  }

  return (
    <WireframePage
      url="https://ccms.edu/executive/events/create"
      title="Create Event"
      subtitle="Enter event details before publishing it."
      searchPlaceholder="Search Events"
    >
      <StatusMessage type={message ? 'success' : undefined}>{message}</StatusMessage>

      <form className="form-panel">
        <label>
          Event Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
          />
        </label>

        <label>
          Club
          <input
            type="text"
            name="club"
            value={formData.club}
            onChange={handleChange}
            placeholder="Enter club name"
          />
        </label>

        <label>
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </label>

        <label>
          Time
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />
        </label>

        <label>
          Location
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter event location"
          />
        </label>

        <label className="full-width">
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
          />
        </label>

        <div className="button-row">
          <button type="button" onClick={handleCancel}>Cancel</button>
          <button type="submit" onClick={handleSaveDraft}>Save Draft</button>
          <button type="submit" onClick={handlePublish}>Publish Event</button>
        </div>
      </form>
    </WireframePage>
  );
}
