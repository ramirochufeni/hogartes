export type NotificationRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';
export type NotificationType = 'message' | 'review' | 'subscription' | 'alert' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

// Arrays vacíos — pendiente de implementación real con backend
export const mockClientNotifications: AppNotification[] = [];
export const mockProviderNotifications: AppNotification[] = [];
export const mockAdminNotifications: AppNotification[] = [];
