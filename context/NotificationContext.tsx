import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Notification, NotificationType } from '../types';
import { ToastContainer } from '../components/common/Toast';

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((
    type: NotificationType, 
    title: string, 
    message?: string, 
    duration: number = 4000
  ) => {
    const id = crypto.randomUUID();
    const newNotification: Notification = { id, type, title, message, duration };

    setNotifications((prev) => [...prev, newNotification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const value = { notify, removeNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer notifications={notifications} onDismiss={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};