'use client';

import styles from './detailcustomordermodal.module.css';
import { DetailCustomOrder } from '@/interfaces/interfaces';
import Image from 'next/image';
import React from 'react';

interface DetailCustomOrderModalProps {
    detail: DetailCustomOrder;
    onClose: () => void;
}

const DetailCustomOrderModal = ({ detail, onClose }: DetailCustomOrderModalProps) =>
{
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Torta Personalizada</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    {detail.imageUrl && (
                        <div className={styles.imageContainer}>
                            <Image src={detail.imageUrl} alt="Torta Personalizada" width={380} height={300} />
                        </div>
                    )}
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Libras</span>
                            <span className={styles.detailValue}>{detail.pounds} lbs</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Pisos</span>
                            <span className={styles.detailValue}>{detail.tiers}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Precio</span>
                            <span className={styles.detailValue}>${detail.price}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailCustomOrderModal;
