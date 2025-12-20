'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/interfaces/interfaces';
import { toast } from 'sonner';
import { NotificationType } from '@/interfaces/enums';
import { useFetch } from '@/hooks/useFetch';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    getUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) =>
{
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { isLoading, error, execute } = useFetch('/api/notification', {
        immediate: false
    })

    useEffect(() =>
    {
        if (!isAuthenticated || !user)
        {
            if (socket)
            {
                socket.disconnect();
                setSocket(null);
            }
            setIsConnected(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) return;

        const newSocket = io(`${SOCKET_URL}/notifications`, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () =>
        {
            console.log('Conectado al servidor de notificaciones');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () =>
        {
            console.log('Desconectado del servidor de notificaciones');
            setIsConnected(false);
        });

        newSocket.on('new-notification', (notification: Notification) =>
        {
            console.log('Nueva notificación recibida:', notification);

            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            showNotificationToast(notification);
        });

        newSocket.on('error', (error) =>
        {
            console.error('Error en socket:', error);
            toast.error('Error de conexión con notificaciones');
        });

        setSocket(newSocket);
        fetchNotifications();

        return () =>
        {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    const showNotificationToast = (notification: Notification) =>
    {
        const toastOptions = {
            duration: 5000,
        };

        switch (notification.type)
        {
            case NotificationType.STORE_REQUEST_CREATED:
                toast.info(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.STORE_REQUEST_APPROVED:
                toast.success(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.STORE_REQUEST_REJECTED:
                toast.error(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.CUSTOM_ORDER_CREATED:
                toast.info(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.CUSTOM_ORDER_COMPLETED:
                toast.success(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.CASH_CLOSING_PENDING:
                toast.warning(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            case NotificationType.SYSTEM_ALERT:
                toast.warning(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
                break;
            default:
                toast(notification.title, {
                    description: notification.message,
                    ...toastOptions,
                });
        }
    };

    const fetchNotifications = async () =>
    {
        try
        {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const data = await execute();

            if (data)
            {
                const unread = data.filter((n: Notification) => !n.isRead).length;
                setNotifications(data);
                setUnreadCount(unread);
            }
        }
        catch (error)
        {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    const getUnreadCount = async () =>
    {
        try
        {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const data = await execute({
                method: 'GET',
            }, `/api/notification/get-unread-count`);

            if (data)
            {
                setUnreadCount(data);
            }
        }
        catch (error)
        {
            console.error('Error al obtener el conteo de no leídas:', error);
        }
    }

    const markAsRead = async (notificationId: string) =>
    {
        try
        {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const data = await execute({
                method: 'GET',
            }, `/api/notification/mark-as-read/${notificationId}`);

            if (data)
            {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        catch (error)
        {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const markAllAsRead = async () =>
    {
        try
        {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const data = await execute({
                method: 'GET',
            }, `/api/notification/mark-all-as-read`);

            if (data==0)
            {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
                );
                setUnreadCount(0);
                toast.success('Todas las notificaciones marcadas como leídas');
            }
        }
        catch (error)
        {
            console.error('Error al marcar todas como leídas:', error);
            toast.error('Error al marcar notificaciones como leídas');
        }
    };

    const deleteNotification = async (notificationId: string) =>
    {
        try
        {
            const token = localStorage.getItem('authToken');

            if (!token) return;

            const notificationToDelete = notifications.find(n => n.id === notificationId);

            const data = await execute({
                method: 'DELETE',
            }, `/api/notification/${notificationId}`);

            if (data)
            {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));

                if (notificationToDelete && !notificationToDelete.isRead) setUnreadCount(prev => Math.max(0, prev - 1));

                toast.success('Notificación eliminada');
            }
        }
        catch (error)
        {
            console.error('Error al eliminar notificación:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    const refreshNotifications = async () =>
    {
        await fetchNotifications();
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isConnected,
                getUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications()
{
    const context = useContext(NotificationContext);

    if (context === undefined) throw new Error('useNotifications debe ser usado dentro de NotificationProvider');

    return context;
}
