import { ReactNode } from 'react';
import styles from './optioncard.module.css';
import Link from 'next/link';
import { ArrowRightDot } from '@/app/components/svg';

interface OptionCardProps {
    className: string;
    title: string;
    hook: string;
    subtitle: string;
    icon: ReactNode;
    link: string;
}

const OptionCard = ({ className, title, hook, subtitle, icon, link }: OptionCardProps) =>
{
    return (
        <Link href={`/dashboard${link}`}>
            <div className={`${styles.optioncard} ${styles[className]}`}>
                <div className={styles.optioncardtop}>
                    <h2>{title}</h2>
                    <p><span>{hook}</span>{` ${subtitle}`}</p>
                </div>
                <div className={styles.optionicons}>
                    <ArrowRightDot />
                    <span>{icon}</span>
                </div>
            </div>
        </Link>
    );
}

export default OptionCard;