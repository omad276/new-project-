import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { TokenStorage } from '@/lib/api';

export type NotificationType =
  | 'new_message'
  | 'property_approved'
  | 'property_rejected'
  | 'new_favorite'
  | 'price_update'
  | 'new_inquiry'
  | 'system';

export interface Notification {
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

export interface PropertyUpdate {
  propertyId: string;
  action: 'created' | 'updated' | 'deleted';
  data?: Record<string, unknown>;
  timestamp: Date;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
  markAsRead: (index: number) => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://space-api-bh91.onrender.com';

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = TokenStorage.getAccessToken();

    // Don't connect if no token
    if (!token) {
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Handle notifications
    socket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
        });
      }
    });

    // Handle property updates
    socket.on('property_update', (update: PropertyUpdate) => {
      console.log('Property update:', update);
      // Could dispatch to a store or context here
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    clearNotifications,
    markAsRead,
  };
}

/**
 * Request notification permission
 */
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }

  return Notification.requestPermission();
}
