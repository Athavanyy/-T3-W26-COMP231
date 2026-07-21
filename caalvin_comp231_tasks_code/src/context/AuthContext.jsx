import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { mockDefaultUser } from '../services/mockApi.js';

function normalizeRole(role) {
  switch (String(role || '').toUpperCase()) {
    case 'STUDENT':
      return 'Student';
    case 'CLUB_EXECUTIVE':
      return 'Club Executive';
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return 'Administrator';
    default:
      return role || 'Student';
  }
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: normalizeRole(user.role),
    isDisabled: Boolean(user.isDisabled ?? user.disabled ?? user.status === 'INACTIVE' ?? user.status === 'DISABLED')
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ccms_user');
    return normalizeUser(savedUser ? JSON.parse(savedUser) : mockDefaultUser);
  });

  function saveUser(nextUser) {
    const normalizedUser = normalizeUser(nextUser);
    localStorage.setItem('ccms_user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  }

  function switchTestUser(nextUser) {
    return saveUser(nextUser);
  }

  async function login(email, password) {
    const loggedInUser = await api.login({ email, password });
    return saveUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem('ccms_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, switchTestUser, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
