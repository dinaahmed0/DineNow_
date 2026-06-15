import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((message: string, type: AppNotification['type'] = 'info') => {
    const n: AppNotification = {
      id: `${type}-${Date.now()}`,
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [n, ...prev].slice(0, 50));

    if (type === 'success') toast.success(message, { duration: 5000 });
    else if (type === 'error') toast.error(message, { duration: 5000 });
    else if (type === 'warning') toast(message, { icon: '⚠️', duration: 5000 });
    else toast(message, { icon: '🔔', duration: 5000 });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: AppNotification['type'] }>).detail;
      addNotification(message, type);
    };
    window.addEventListener('app:signalr-notification', handler);
    return () => window.removeEventListener('app:signalr-notification', handler);
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
