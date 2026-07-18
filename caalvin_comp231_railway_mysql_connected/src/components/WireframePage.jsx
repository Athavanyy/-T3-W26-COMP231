import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
  const { logout } = useAuth();

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
              <button type="button" className="logout-box" onClick={logout}>Log out</button>
            </aside>
          )}

          <section className="screen-area">
            <div className="top-controls">
              <input className="search-box" placeholder={searchPlaceholder} />
            </div>

            <header className="screen-heading">
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
