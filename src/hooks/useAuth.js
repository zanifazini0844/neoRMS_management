import { useEffect, useState, useCallback } from 'react';
import { getAccessToken, getUserRole, clearAuthCredentials } from '@/services/authStorage';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(getAccessToken());
  });
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return null;
    return getUserRole();
  });

  const handleStorage = useCallback(() => {
    const token = getAccessToken();
    const storedRole = getUserRole();

    setIsAuthenticated(Boolean(token));
    setRole(storedRole || null);
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [handleStorage]);

  const logout = () => {
    clearAuthCredentials();
    setIsAuthenticated(false);
    setRole(null);
  };

  return { isAuthenticated, role, logout };
}