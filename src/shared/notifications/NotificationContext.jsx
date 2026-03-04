import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToNotifications } from '../../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      if (notification.remove) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } else {
        setNotifications(prev => [...prev, notification]);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
