import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframePage from '../../components/WireframePage.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { api } from '../../services/api.js';
import { mockClubs } from '../../services/mockApi.js';

export default function BrowseClubs() {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await api.getClubs();
        setClubs(Array.isArray(data) ? data : data.clubs || []);
      } catch (err) {
        setError(`${err.message}. Showing prototype test data.`);
        setClubs(mockClubs);
      } finally {
        setLoading(false);
      }
    }
    loadClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return clubs;

    return clubs.filter((club) => (
      club.name?.toLowerCase().includes(keyword)
      || club.category?.toLowerCase().includes(keyword)
      || club.description?.toLowerCase().includes(keyword)
    ));
  }, [clubs, searchTerm]);

  const noResults = !loading && filteredClubs.length === 0;

  return (
    <WireframePage
      url="https://ccms.edu/clubs"
      title="Browse Clubs"
      subtitle="Discover clubs that match your interests."
      searchPlaceholder="Search Clubs"
      controls={(
        <>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search Clubs"
          />
          <select><option>All Categories</option><option>Technology</option><option>Environment</option><option>Arts</option></select>
          <label><input type="checkbox" /> Open to Join</label>
          <label><input type="checkbox" /> Popular</label>
        </>
      )}
    >
      <StatusMessage type="error">{error}</StatusMessage>
      {loading && <StatusMessage>Loading clubs...</StatusMessage>}
      {!loading && noResults && (
        <StatusMessage>No clubs found matching "{searchTerm.trim()}".</StatusMessage>
      )}
      {!loading && !noResults && (
        <section className="wire-grid">
          {filteredClubs.slice(0, 3).map((club) => (
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
      )}
    </WireframePage>
  );
}
