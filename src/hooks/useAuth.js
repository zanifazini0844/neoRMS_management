import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('authToken'));
  });
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authRole');
  });

  const handleStorage = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('authRole');

    setIsAuthenticated(Boolean(token));
    setRole(storedRole || null);
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [handleStorage]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setIsAuthenticated(false);
    setRole(null);
  };

  return { isAuthenticated, role, logout };
}