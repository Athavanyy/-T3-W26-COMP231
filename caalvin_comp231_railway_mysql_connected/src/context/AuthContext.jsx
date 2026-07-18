import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const testUsers = [
  { id: 'student-001', name: 'Test Student', role: 'Student', isDisabled: false, email: 'student@college.edu', password: 'password123' },
  { id: 'exec-001', name: 'Test Executive', role: 'Club Executive', isDisabled: false, email: 'executive@college.edu', password: 'password123' },
  { id: 'admin-001', name: 'Test Admin', role: 'Administrator', isDisabled: false, email: 'admin@college.edu', password: 'password123' },
  { id: 'disabled-001', name: 'Disabled User', role: 'Student', isDisabled: true, email: 'disabled@college.edu', password: 'password123' }
];

const DEFAULT_USER = testUsers[0];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ccms_user');
    if (!savedUser) return DEFAULT_USER;

    try {
      return JSON.parse(savedUser);
    } catch {
      return DEFAULT_USER;
    }
  });

  function switchTestUser(nextUser) {
    if (!nextUser) {
      localStorage.removeItem('ccms_user');
      setUser(null);
      return;
    }

    localStorage.setItem('ccms_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function login(nextUser) {
    if (!nextUser || nextUser.isDisabled) return;
    localStorage.setItem('ccms_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function loginWithCredentials(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    const account = testUsers.find((candidate) => !candidate.isDisabled && candidate.email?.toLowerCase() === normalizedEmail && candidate.password === password);

    if (!account) {
      return false;
    }

    localStorage.setItem('ccms_user', JSON.stringify(account));
    setUser(account);
    return true;
  }

  function logout() {
    localStorage.removeItem('ccms_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, loginWithCredentials, logout, switchTestUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
