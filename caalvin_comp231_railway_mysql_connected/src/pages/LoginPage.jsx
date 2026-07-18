import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, testUsers } from '../context/AuthContext.jsx';

function getHomeRoute(role) {
  switch (role) {
    case 'Club Executive':
      return '/executive/dashboard';
    case 'Administrator':
      return '/admin/users/test-user-001/role';
    default:
      return '/student/clubs';
  }
}

export default function LoginPage() {
  const { user, login, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Enter your email/username and password to continue.');

  useEffect(() => {
    if (user) {
      navigate(getHomeRoute(user.role), { replace: true });
    }
  }, [user, navigate]);

  function handleSubmit(event) {
    event.preventDefault();
    const success = loginWithCredentials(email, password);
    if (!success) {
      setMessage('Invalid credentials. Use student@college.edu, executive@college.edu, or admin@college.edu with the password password123.');
      return;
    }
    setMessage('Signed in successfully.');
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <div className="auth-intro">
          <p className="eyebrow">Campus Clubs</p>
          <h1>Sign in to continue</h1>
          <p>Select the role you want to use. Each account opens a different workspace for students, club executives, and administrators.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email / Username</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@college.edu" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
          </label>
          <button className="wire-button" type="submit" disabled={!email.trim() || !password.trim()}>Sign in</button>
          <p className="auth-message">{message}</p>
        </form>

        <div className="auth-grid">
          {testUsers.map((account) => (
            <article key={account.id} className="auth-option">
              <div className="auth-option-header">
                <span className="role-pill">{account.role}</span>
                {account.isDisabled && <span className="status-pill disabled">Disabled</span>}
              </div>
              <h2>{account.name}</h2>
              <p>
                {account.role === 'Student' && 'Browse clubs, view details, and request to join.'}
                {account.role === 'Club Executive' && 'Manage events, posts, and executive club operations.'}
                {account.role === 'Administrator' && 'Approve clubs and update user roles.'}
              </p>
              <button
                className="wire-button"
                type="button"
                onClick={() => login(account)}
                disabled={account.isDisabled}
              >
                {account.isDisabled ? 'Unavailable' : 'Use this role'}
              </button>
            </article>
          ))}
        </div>

        <p className="auth-help">
          The backend creates users with an email-style username and the password <strong>password123</strong> for active accounts.
        </p>
        <Link className="text-link" to="/">Back to home</Link>
      </section>
    </main>
  );
}
