import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken, getUserRole } from '@/services/authStorage';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const token = getAccessToken();
  const role = getUserRole();

  // If there is no auth session, send user to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If allowedRoles is provided and the current role is not allowed, redirect
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.map((r) => String(r).toLowerCase()).includes(role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Otherwise, render the protected content
  return children;
}

export default ProtectedRoute;


