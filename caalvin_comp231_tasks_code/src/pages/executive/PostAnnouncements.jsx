import { useState } from 'react';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';

export default function PostAnnouncements() {
  const [form, setForm] = useState({ title: 'Weekly Club Update', content: 'Meeting this Friday at Progress Campus. Please arrive on time.' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage('Announcement title is required.');
      return;
    }
    if (form.content.trim().length < 10) {
      setMessage('Announcement content must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.postAnnouncement(form);
      setMessage('Announcement was validated and posted successfully.');
    } catch (err) {
      setMessage(`${err.message}. Local validation passed, but backend announcement endpoint needs review.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage
      url="https://ccms.edu/executive/announcements"
      title="Post Announcement"
      subtitle="Create an announcement and publish it for students."
      searchPlaceholder="Search Announcements"
    >
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>Announcement Title<input name="title" value={form.title} onChange={updateField} /></label>
        <label>Content<textarea name="content" value={form.content} onChange={updateField} /></label>
        <button disabled={submitting}>{submitting ? 'Posting...' : 'Post Announcement'}</button>
      </form>
      <StatusMessage type={message.includes('successfully') ? 'success' : 'error'}>{message}</StatusMessage>
    </WireframePage>
  );
}
