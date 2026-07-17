import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';

export default function RegisterEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    attendance: '',
    notes: '',
    agree: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.studentId || !formData.attendance) {
      setError('Please complete all required fields before registering.');
      setMessage('');
      return;
    }

    if (!formData.agree) {
      setError('You must agree to the event rules and guidelines before registering.');
      setMessage('');
      return;
    }

    setError('');
    setMessage(`Registration submitted for ${formData.name} for event ${eventId}.`);
  }

  function handleCancel() {
    navigate(-1);
  }

  return (
    <WireframePage
      url="https://ccms.edu/events/register"
      title="Register for Event"
      subtitle="Complete the registration form to sign up for the activity."
      searchPlaceholder="Search Events"
    >
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type={message ? 'success' : undefined}>{message}</StatusMessage>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          Student Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </label>

        <label>
          Student ID
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Enter your student ID"
          />
        </label>

        <label>
          Attendance
          <input
            type="text"
            name="attendance"
            value={formData.attendance}
            onChange={handleChange}
            placeholder="Enter attendance details"
          />
        </label>

        <label className="full-width">
          Additional Notes <span className="optional">(optional)</span>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes for the event organizer"
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
          />
          <span>
            I agree to follow the event rules and guidelines. I understand that failure to comply may result in removal from the event.
          </span>
        </label>

        <div className="button-row">
          <button type="button" onClick={handleCancel}>Cancel</button>
          <button type="submit">Register</button>
        </div>
      </form>
    </WireframePage>
  );
}