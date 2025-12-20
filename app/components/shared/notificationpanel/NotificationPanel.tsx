import { useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/interfaces/enums';
import styles from './notificationpanel.module.css';
import { Bell, Check, X } from '@/app/components/svg';
import { Notification } from '@/interfaces/interfaces';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) =>
{
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isConnected
    } = useNotifications();

    if (!isOpen) return null;

    const getNotificationIcon = (type: NotificationType) =>
    {
        switch (type)
        {
            case NotificationType.STORE_REQUEST_CREATED:
            case NotificationType.STORE_REQUEST_APPROVED:
            case NotificationType.STORE_REQUEST_REJECTED:
            case NotificationType.CUSTOM_ORDER_CREATED:
            case NotificationType.CUSTOM_ORDER_COMPLETED:
            case NotificationType.CASH_CLOSING_PENDING:
            case NotificationType.CASH_CLOSING_APPROVED:
            case NotificationType.CASH_CLOSING_REJECTED:
            case NotificationType.SYSTEM_ALERT:
            default:
                return <Bell />;
        }
    }

    const getNotificationColor = (type: NotificationType) =>
    {
        switch (type)
        {
            case NotificationType.STORE_REQUEST_APPROVED:
            case NotificationType.CUSTOM_ORDER_COMPLETED:
            case NotificationType.CASH_CLOSING_APPROVED:
                return styles.success;
            case NotificationType.STORE_REQUEST_REJECTED:
            case NotificationType.CASH_CLOSING_REJECTED:
                return styles.error;
            case NotificationType.SYSTEM_ALERT:
            case NotificationType.CASH_CLOSING_PENDING:
                return styles.warning;
            default:
                return styles.info;
        }
    }

    const formatTime = (date: Date) =>
    {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffMs = now.getTime() - notificationDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return notificationDate.toLocaleDateString();
    }

    const handleNotificationClick = async (notification: Notification) =>
    {
        if (!notification.isRead) await markAsRead(notification.id);
    }

    const handleDelete = async (e: React.MouseEvent, notificationId: string) =>
    {
        e.stopPropagation();
        await deleteNotification(notificationId);
    }

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.panel}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerLeftTop}>
                            <h3 className={styles.title}>Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className={styles.badge}>{unreadCount}</span>
                            )}
                        </div>
                        <div className={styles.connectionStatus}>
                            <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`} />
                            <span className={styles.statusText}>
                                  {isConnected ? 'Conectado' : 'Desconectado'}
                              </span>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        {unreadCount > 0 && (
                            <button
                                className={styles.markAllButton}
                                onClick={() => {
                                    markAllAsRead();
                                    onClose();
                                }}
                                title="Marcar todas como leídas"
                            >
                                <Check/> Marcar todas como leídas
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de notificaciones */}
                <div className={styles.list}>
                    {notifications.length === 0 ? (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}><Bell /></span>
                            <p className={styles.emptyText}>No tienes notificaciones</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={styles.itemLeft}>
                                      <span className={`${styles.icon} ${getNotificationColor(notification.type)}`}>
                                          {getNotificationIcon(notification.type)}
                                      </span>
                                </div>

                                <div className={styles.itemContent}>
                                    <div className={styles.itemHeader}>
                                        <h4 className={styles.itemTitle}>{notification.title}</h4>
                                        <span className={styles.itemTime}>
                                              {formatTime(notification.createdAt)}
                                          </span>
                                    </div>
                                    <p className={styles.itemMessage}>{notification.message}</p>
                                </div>

                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    title="Eliminar notificación"
                                >
                                    <X />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default NotificationPanel;
