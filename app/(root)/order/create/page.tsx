"use client"

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QrOrderForm from '@/app/components/order/qrorderform/QrOrderForm';
import styles from './page.module.css';

interface TokenPayload {
    id: string;
    userId: string;
    name: string;
    username: string;
    role: string;
    storeId: string;
    scope: string;
    exp: number;
}

const OrderCreateContent = () =>
{
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [payload, setPayload] = useState<TokenPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() =>
    {
        if (!token)
        {
            setError('No se proporcionó un enlace válido.');
            return;
        }

        try
        {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Token inválido');

            const decoded = JSON.parse(atob(parts[1])) as TokenPayload;

            if (decoded.exp * 1000 < Date.now())
            {
                setError('Este enlace ha expirado. Solicita uno nuevo.');
                return;
            }

            if (decoded.scope !== 'qr-order')
            {
                setError('Enlace no válido para esta acción.');
                return;
            }

            setPayload(decoded);
        }
        catch (e)
        {
            setError('Enlace inválido. Verifica que el código QR sea correcto.');
        }
    }, [token]);

    if (error)
    {
        return (
            <div className={styles.errorContainer}>
                <h2>Enlace Inválido</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (success)
    {
        return (
            <div className={styles.successContainer}>
                <h2>Pedido Enviado</h2>
                <p>Tu pedido personalizado ha sido registrado exitosamente. Puedes cerrar esta página.</p>
            </div>
        );
    }

    if (!payload || !token)
    {
        return <div className={styles.loading}>Cargando...</div>;
    }

    return (
        <QrOrderForm
            token={token}
            userId={payload.userId}
            storeId={payload.storeId}
            onSuccess={() => setSuccess(true)}
        />
    );
}

const OrderCreate = () =>
{
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Nuevo Pedido Personalizado</h1>
                <p>Completa el formulario para crear tu pedido</p>
            </div>
            <Suspense fallback={<div className={styles.loading}>Cargando...</div>}>
                <OrderCreateContent />
            </Suspense>
        </div>
    );
}

export default OrderCreate;
