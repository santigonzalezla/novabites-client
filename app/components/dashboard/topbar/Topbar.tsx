import styles from './topbar.module.css';
import UserDropdown from '@/app/components/dashboard/userdropdown/UserDropdown';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Moon, Sun } from '@/app/components/svg';


const Topbar = () =>
{
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.top}>
            <h1>¡Bienvenido, {user?.name.split(' ')[0]}!</h1>
            <div className={styles.topright}>
                <button
                    onClick={toggleTheme}
                    className={styles.themeToggle}
                    title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon /> : <Sun />}
                </button>
                <UserDropdown />
            </div>
        </div>
    );
}

export default Topbar;