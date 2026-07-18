import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockClubs } from '../../services/mockApi.js';

function dedupeClubs(items) {
  const seen = new Set();
  return items.filter((club) => {
    const nameKey = club.name?.trim().toLowerCase();
    const key = nameKey || club._id || club.id;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default function BrowseClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await api.getClubs();
        const normalized = Array.isArray(data) ? data : data?.clubs || [];
        setClubs(dedupeClubs(normalized));
      } catch (err) {
        setError(`${err.message}. Showing prototype test data.`);
        setClubs(dedupeClubs(mockClubs));
      } finally {
        setLoading(false);
      }
    }
    loadClubs();
  }, []);

  return (
    <WireframePage
      url="https://ccms.edu/clubs"
      title="Browse Clubs"
      subtitle="Discover clubs that match your interests."
      searchPlaceholder="Search Clubs"
      controls={(
        <>
          <select><option>All Categories</option><option>Technology</option><option>Environment</option><option>Arts</option></select>
          <label><input type="checkbox" /> Open to Join</label>
          <label><input type="checkbox" /> Popular</label>
        </>
      )}
    >
      <StatusMessage type="error">{error}</StatusMessage>
      {loading && <StatusMessage>Loading clubs...</StatusMessage>}
      {!loading && clubs.length === 0 && <StatusMessage>No clubs are available.</StatusMessage>}
      <section className="wire-grid">
        {clubs.map((club) => (
          <article className="wire-card" key={club.id || club._id}>
            <div>
              <h2>{club.name}</h2>
              <p>{club.description}</p>
              <p>{club.members ?? 'N/A'} members</p>
            </div>
            <Link className="wire-button" to={`/student/clubs/${club.id || club._id}`}>View</Link>
          </article>
        ))}
      </section>
    </WireframePage>
  );
}
