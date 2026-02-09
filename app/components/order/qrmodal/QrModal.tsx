"use client"

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './qrmodal.module.css';
import { useFetch } from '@/hooks/useFetch';
import { APP_URL } from '@/lib/constants';

interface QrModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QrModal = ({ isOpen, onClose }: QrModalProps) =>
{
    const { execute, isLoading } = useFetch<{ token: string; expiresIn: string }>('/api/auth/qr-token', { immediate: false });
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>
    {
        if (isOpen && !qrToken) generateToken();
    }, [isOpen]);

    const generateToken = async () =>
    {
        setError(null);

        const result = await execute({ method: 'POST' });

        if (result)
        {
            setQrToken(result.token);
        }
        else
        {
            setError('Error al generar el código QR. Intente nuevamente.');
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Código QR</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    {isLoading && !qrToken ? (
                        <p className={styles.info}>Generando código QR...</p>
                    ) : error ? (
                        <>
                            <p className={styles.error}>{error}</p>
                            <button
                                className={styles.generateButton}
                                onClick={generateToken}
                                disabled={isLoading}
                            >
                                Reintentar
                            </button>
                        </>
                    ) : qrToken ? (
                        <>
                            <div className={styles.qrContainer}>
                                <QRCodeSVG
                                    value={`${APP_URL}/order/create?token=${qrToken}`}
                                    size={220}
                                    level="M"
                                />
                            </div>
                            <p className={styles.info}>
                                Escanea este código QR desde un teléfono para abrir el formulario de pedido personalizado.
                            </p>
                            <p className={styles.expiry}>Válido por 4 horas</p>
                            <button
                                className={styles.generateButton}
                                onClick={generateToken}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Generando...' : 'Generar Nuevo Código'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default QrModal
