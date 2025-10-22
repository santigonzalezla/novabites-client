'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { StoreRequest } from '@/interfaces/interfaces';
import { Calendar, Store as StoreIcon, User } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import StoreRequestDetailsModal from '@/app/components/requestslist/storerequestdetailsmodal/StoreRequestDetailsModal';

interface RequestItem {
    id: string;
    requestNumber: string;
    type: string;
    status: string;
    targetStoreName: string;
    requestingUserName: string;
    requestedDate: Date | string;
}

const RequestsList = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<StoreRequest[]>([]);
    const [requestsList, setRequestsList] = useState<RequestItem[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const { error, isLoading, execute } = useFetch<StoreRequest[]>(`/api/store-request/store/${user?.storeId}`, {
        immediate: false
    });

    useEffect(() =>
    {
        const fetchRequests = async () =>
        {
            const requestsData = await execute();
            if (requestsData)
            {
                console.log('Store Requests:', requestsData);
                setRequests(requestsData);
            }
        }

        if (user?.storeId) {
            fetchRequests();
        }
    }, [user?.storeId]);

    useEffect(() =>
    {
        const mappedRequests: RequestItem[] = requests.map((request) => ({
            id: request.id,
            requestNumber: `REQ-${request.numId}`,
            type: request.type,
            status: request.status,
            targetStoreName: request.targetStore?.name || 'Tienda no especificada',
            requestingUserName: request.requestingUser?.name || 'Usuario desconocido',
            requestedDate: request.requestedDate
        }));

        mappedRequests.sort((a, b) =>
        {
            const dateA = new Date(a.requestedDate).getTime();
            const dateB = new Date(b.requestedDate).getTime();
            return dateB - dateA;
        });

        setRequestsList(mappedRequests);
    }, [requests]);

    const formatDate = (date: Date | string) =>
    {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(dateObj);
    }

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'SUPPLY_REQUEST': 'Solicitud de Suministro',
            'RETURN_REQUEST': 'Devolución',
            'RELOCATION_REQUEST': 'Reubicación'
        };
        return labels[type] || type;
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            'PENDING': { label: 'Pendiente', className: styles.statusPending },
            'APPROVED': { label: 'Aprobada', className: styles.statusApproved },
            'REJECTED': { label: 'Rechazada', className: styles.statusRejected },
            'IN_PROGRESS': { label: 'En Proceso', className: styles.statusInProgress },
            'COMPLETED': { label: 'Completada', className: styles.statusCompleted },
            'CANCELED': { label: 'Cancelada', className: styles.statusCanceled }
        };
        const badge = badges[status] || { label: status, className: styles.statusDefault };
        return <span className={`${styles.statusBadge} ${badge.className}`}>{badge.label}</span>;
    }

    if (error) {
        return (
            <div className={styles.requests}>
                <div className={styles.content}>
                    <p>Error al cargar las solicitudes</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.requests}>
            <div className={styles.top}>
                <BackButton />
                <h1>Gestiona tus Solicitudes!</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Listado de Solicitudes</h1>
                    <p className={styles.subtitle}>
                        {requestsList.length} {requestsList.length === 1 ? "solicitud" : "solicitudes"} registradas
                    </p>
                </div>

                {isLoading ? (
                    <div className={styles.content}>
                        <p>Cargando solicitudes...</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {requestsList.length === 0 ? (
                            <p>No hay solicitudes registradas</p>
                        ) : (
                            requestsList.map((request) => (
                                <div key={request.id} className={styles.requestCard}>
                                    <div className={styles.requestHeader}>
                                        <div className={styles.requestNumber}>
                                            <span className={styles.label}>{getTypeLabel(request.type)}</span>
                                            <span className={styles.number}>{request.requestNumber}</span>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>

                                    <div className={styles.requestBody}>
                                        <div className={styles.requestInfo}>
                                            <div className={styles.infoRow}>
                                                <StoreIcon />
                                                <span className={styles.storeName}>{request.targetStoreName}</span>
                                            </div>

                                            <div className={styles.infoRow}>
                                                <User />
                                                <span>Solicitado por: {request.requestingUserName}</span>
                                            </div>
                                        </div>

                                        <div className={styles.requestFooter}>
                                            <div className={styles.requestDate}>
                                                <Calendar />
                                                <span>Fecha: {formatDate(request.requestedDate)}</span>
                                            </div>

                                            <button
                                                className={styles.viewButton}
                                                onClick={() => setSelectedRequest(request.id)}
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedRequest && (
                <StoreRequestDetailsModal
                    requestId={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}

export default RequestsList;