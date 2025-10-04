import styles from './notificationtop.module.css';
import { NotificationAngle } from '@/app/components/svg';

const NotificationTop = () =>
{
    return (
        <div className={styles.notificationtop}>
            <div className={styles.bell}>
                <NotificationAngle />
            </div>
            <h1>Notificaciones</h1>
            <div className={styles.count}>
                <p>4</p>
            </div>
        </div>
    );
}

export default NotificationTop;