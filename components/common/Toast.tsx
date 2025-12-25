import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '../icons';
import { Notification, NotificationType } from '../../types';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: CheckCircleIcon,
  error: XMarkIcon, // Distinctive X for errors
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const STYLES: Record<NotificationType, string> = {
  success: 'bg-white border-green-100 text-green-900 shadow-green-900/5',
  error: 'bg-white border-red-100 text-red-900 shadow-red-900/5',
  warning: 'bg-white border-yellow-100 text-yellow-900 shadow-yellow-900/5',
  info: 'bg-white border-gray-100 text-gray-900 shadow-gray-900/5',
};

const ICON_COLORS: Record<NotificationType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-gray-900',
};

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = ICONS[notification.type];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss logic is handled by the hook, 
    // but we can add a local timer for the exit animation if we wanted strict control.
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to finish before removing from DOM
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg ring-1 ring-black/5
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${STYLES[notification.type]}
      `}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${ICON_COLORS[notification.type]}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-gray-900">{notification.title}</p>
            {notification.message && (
              <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: string) => void }> = ({ notifications, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
};