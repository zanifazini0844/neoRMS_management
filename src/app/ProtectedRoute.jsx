import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;
  const storedRole =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('authRole') || window.localStorage.getItem('role')
      : null;

  const role = storedRole ? String(storedRole).toLowerCase() : null;

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


