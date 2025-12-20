'use client';

import styles from './topbar.module.css';
import UserDropdown from '@/app/components/dashboard/userdropdown/UserDropdown';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Moon, Sun } from '@/app/components/svg';
import { useState } from 'react';
import NotificationPanel from '@/app/components/shared/notificationpanel/NotificationPanel';
import { useNotifications } from '@/context/NotificationContext';


const Topbar = () =>
{
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => setIsPanelOpen(!isPanelOpen);
    const closePanel = () => setIsPanelOpen(false);

    return (
        <div className={styles.top}>
            <h1>¡Bienvenido, {user?.name.split(' ')[0]}!</h1>
            <div className={styles.topright}>
                <div
                    className={styles.topbell}
                    onClick={togglePanel}
                    style={{ cursor: 'pointer' }}
                >
                    <Bell />
                    {unreadCount > 0 && (
                        <span className={styles.notificationCount}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={toggleTheme}
                    className={styles.themeToggle}
                    title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon /> : <Sun />}
                </button>
                <UserDropdown />

                <NotificationPanel isOpen={isPanelOpen} onClose={closePanel} />
            </div>
        </div>
    );
}

export default Topbar;