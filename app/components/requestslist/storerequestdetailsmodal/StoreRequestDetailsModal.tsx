"use client"

import styles from "./storerequestdetailsmodal.module.css";
import { useEffect, useState } from "react";
import type { StoreRequest } from '@/interfaces/interfaces';
import { X } from '@/app/components/svg';
import { toast } from 'sonner';
import { useFetch } from '@/hooks/useFetch';
import RequestStepper from '@/app/components/requestslist/requeststepper/RequestStepper';

interface RequestDetailsModalProps {
    requestId: string;
    onClose: () => void;
}

const StoreRequestDetailsModal = ({ requestId, onClose }: RequestDetailsModalProps) =>
{
    const [requestData, setRequestData] = useState<StoreRequest | null>(null);

    const { execute: executeRequest, isLoading } = useFetch<StoreRequest>(`/api/store-request/${requestId}`, {
        immediate: false,
    });

    useEffect(() =>
    {
        const fetchRequestData = async () =>
        {
            const request = await executeRequest();

            if (request)
            {
                console.log('Request Data:', request);
                setRequestData(request);
            }
            else
            {
                toast.error('No se encontró la solicitud', {
                    description: "No se pudo cargar la información de la solicitud.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }

        fetchRequestData();
    }, [requestId]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(numPrice);
    }

    const formatDate = (date: Date | string) =>
    {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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

    const calculateTotal = () => {
        if (!requestData?.details) return 0;
        return requestData.details.reduce((sum, detail) => {
            const total = typeof detail.totalPrice === 'string'
                ? parseFloat(detail.totalPrice)
                : detail.totalPrice || 0;
            return sum + total;
        }, 0);
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Detalles de la Solicitud</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        <X />
                    </button>
                </div>

                {isLoading || !requestData ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando información...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.requestContent}>
                            {/* Stepper de estado */}
                            <RequestStepper
                                currentStatus={requestData.status}
                                requestedDate={requestData.requestedDate}
                                approvedDate={requestData.approvedDate}
                                completedDate={requestData.completedDate}
                            />

                            {/* Header de la solicitud */}
                            <div className={styles.requestHeader}>
                                <div className={styles.requestInfo}>
                                    <span className={styles.label}>{getTypeLabel(requestData.type)}</span>
                                    <h3 className={styles.requestNumber}>REQ-{requestData.numId}</h3>
                                    <p className={styles.requestDate}>{formatDate(requestData.requestedDate)}</p>
                                </div>
                                <div className={styles.requestTotal}>
                                    <span className={styles.label}>Total</span>
                                    <p className={styles.totalAmount}>{formatPrice(calculateTotal())}</p>
                                </div>
                            </div>

                            {/* Información de las tiendas */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Información de la Solicitud</h4>
                                <div className={styles.storeDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Tienda Solicitante:</span>
                                        <span className={styles.detailValue}>
                                            {requestData.requestingStore?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Tienda Destino:</span>
                                        <span className={styles.detailValue}>
                                            {requestData.targetStore?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Solicitado por:</span>
                                        <span className={styles.detailValue}>
                                            {requestData.requestingUser?.name || 'N/A'}
                                        </span>
                                    </div>
                                    {requestData.approvedByUser && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Aprobado por:</span>
                                            <span className={styles.detailValue}>
                                                {requestData.approvedByUser.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Productos solicitados */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Productos Solicitados</h4>
                                <div className={styles.productsTable}>
                                    <div className={styles.tableHeader}>
                                        <span>Producto</span>
                                        <span>Cantidad</span>
                                        <span>Precio Unit.</span>
                                        <span>Total</span>
                                    </div>
                                    {requestData.details && requestData.details.length > 0 ? (
                                        requestData.details.map((detail) => (
                                            <div key={detail.id} className={styles.tableRow}>
                                                <span className={styles.productName}>
                                                    {detail.product?.name || 'Producto'}
                                                </span>
                                                <span className={styles.quantity}>
                                                    {detail.requestedQuantity}
                                                </span>
                                                <span className={styles.unitPrice}>
                                                    {formatPrice(detail.unitPrice || 0)}
                                                </span>
                                                <span className={styles.itemTotal}>
                                                    {formatPrice(detail.totalPrice || 0)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.noProducts}>No hay productos registrados</p>
                                    )}
                                </div>
                            </div>

                            {/* Motivos de devolución (si es RETURN_REQUEST) */}
                            {requestData.type === 'RETURN_REQUEST' && (
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Motivos de Devolución</h4>
                                    <div className={styles.reasonsList}>
                                        {requestData.details?.map((detail) => (
                                            detail.returnReason && (
                                                <div key={detail.id} className={styles.reasonItem}>
                                                    <span className={styles.reasonProduct}>
                                                        {detail.product?.name}:
                                                    </span>
                                                    <span className={styles.reasonText}>
                                                        {detail.returnReason}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resumen */}
                            <div className={styles.summary}>
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span className={styles.summaryLabel}>Total:</span>
                                    <span className={styles.summaryValue}>
                                        {formatPrice(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className={styles.modalActions}>
                            <button className={styles.closeActionButton} onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default StoreRequestDetailsModal;