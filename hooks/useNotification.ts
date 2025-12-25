import { useState, useCallback } from 'react';
import { Notification, NotificationType } from '../types';

export const useNotification = () => {
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

  return {
    notifications,
    notify,
    removeNotification
  };
};