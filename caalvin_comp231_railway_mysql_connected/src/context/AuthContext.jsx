import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'student-001',
  name: 'Test Student',
  role: 'Student',
  isDisabled: false
};

export function AuthProvider({ children }) {
  // Replace this with your real login/session state if your project already has one.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ccms_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  });

  function switchTestUser(nextUser) {
    localStorage.setItem('ccms_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = useMemo(() => ({ user, switchTestUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
