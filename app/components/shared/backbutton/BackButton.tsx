import styles from './backbutton.module.css';
import { ArrowBack } from '@/app/components/svg';
import Link from 'next/link';

const BackButton = () =>
{
    return (
        <Link href={'/dashboard'}>
            <div className={styles.backbutton}>
                <ArrowBack />
            </div>
        </Link>
    );
}

export default BackButton;