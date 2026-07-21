import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function normalizeRoleValue(role) {
  return String(role || '').replace(/\s+/g, '').toLowerCase();
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const normalizedUserRole = normalizeRoleValue(user.role);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRoleValue(role));

  if (user.isDisabled || !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
