import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const testUsers = [
  { id: 'student-001', name: 'Test Student', role: 'Student', isDisabled: false },
  { id: 'exec-001', name: 'Test Executive', role: 'Club Executive', isDisabled: false },
  { id: 'admin-001', name: 'Test Admin', role: 'Administrator', isDisabled: false },
  { id: 'disabled-001', name: 'Disabled User', role: 'Student', isDisabled: true }
];

const menuItems = [
  { label: 'Dashboard', to: '/student/clubs' },
  { label: 'Clubs', to: '/student/clubs' },
  { label: 'Events', to: '/student/events/select' },
  { label: 'Executive', to: '/executive/dashboard' },
  { label: 'Announcements', to: '/executive/announcements' },
  { label: 'Admin', to: '/admin/users/test-user-001/role' }
];

export default function WireframePage({
  url = 'https://ccms.edu/dashboard',
  title,
  subtitle,
  children,
  controls,
  searchPlaceholder = 'Search',
  sidebar = true
}) {
  const { user, switchTestUser } = useAuth();

  return (
    <main className="app-shell">
      <section className="app-window">
        <div className="browser-bar">
          <div className="browser-dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <div className="url-bar">{url}</div>
        </div>

        <div className={sidebar ? 'app-body' : 'app-body no-sidebar'}>
          {sidebar && (
            <aside className="side-menu" aria-label="Application navigation">
              <div className="brand-block">
                <span className="brand-mark">CC</span>
                <div>
                  <strong>Campus Clubs</strong>
                  <small>Management System</small>
                </div>
              </div>
              <nav>
                {menuItems.map((item) => <Link key={item.label} to={item.to}>{item.label}</Link>)}
              </nav>
              <span className="logout-box">Log out</span>
            </aside>
          )}

          <section className="screen-area">
            <div className="top-controls">
              <input className="search-box" placeholder={searchPlaceholder} />
              <select
                className="role-select"
                value={user.id}
                onChange={(event) => switchTestUser(testUsers.find((u) => u.id === event.target.value))}
                title="Switch role for acceptance testing"
              >
                {testUsers.map((testUser) => (
                  <option key={testUser.id} value={testUser.id}>
                    {testUser.role}{testUser.isDisabled ? ' - Disabled' : ''}
                  </option>
                ))}
              </select>
            </div>

            <header className="screen-heading">
              <p className="eyebrow">Release 1.0 · Caalvin Tasks</p>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </header>

            {controls && <div className="filter-row">{controls}</div>}
            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
