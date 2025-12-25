import { useNotification as useNotificationContext } from '../context/NotificationContext';

/**
 * Re-exporting the hook from the context for consistent imports across the app.
 * This replaces the old local-state implementation.
 */
export const useNotification = useNotificationContext;