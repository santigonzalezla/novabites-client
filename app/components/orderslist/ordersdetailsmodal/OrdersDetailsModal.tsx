"use client"

import styles from "./ordersdetailsmodal.module.css";
import { useEffect, useState } from "react";
import type { Bill, Order, CustomOrder } from '@/interfaces/interfaces';
import { Printer, X } from '@/app/components/svg';
import { toast } from 'sonner';
import { useFetch } from '@/hooks/useFetch';

interface OrdersDetailsModalProps {
    orderId: string;
    type: 'order' | 'customOrder';
    onClose: () => void;
}

const OrdersDetailsModal = ({ orderId, type, onClose }: OrdersDetailsModalProps) =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [billData, setBillData] = useState<Bill | null>(null);
    const [orderData, setOrderData] = useState<Order | CustomOrder | null>(null);

    const billEndpoint = type === 'customOrder'
        ? `/api/bill/custom-order/${orderId}`
        : `/api/bill/order/${orderId}`;

    const { execute: executeBill, isLoading } = useFetch<Bill>(billEndpoint, {
        immediate: false,
    });

    const { execute: executePdf } = useFetch<Blob>('/api/bill/generate', {
        immediate: false,
        responseType: 'blob',
        method: 'POST'
    });

    useEffect(() =>
    {
        const fetchBillData = async () =>
        {
            const bill = await executeBill();

            if (bill)
            {
                setBillData(bill);
                if (type === 'order' && bill.order) setOrderData(bill.order);
                else if (type === 'customOrder' && bill.customOrder) setOrderData(bill.customOrder);
            }
            else
            {
                toast.error('No se encontró la factura', {
                    description: "No se pudo cargar la información de la factura.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }

        fetchBillData();
    }, [orderId, type]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    }

    const formatDate = (date: Date | string) =>
    {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(dateObj);
    }

    const downloadFile = (blob: Blob, filename: string) =>
    {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = async () =>
    {
        if (!billData) return;

        setIsGenerating(true);

        try
        {
            const pdfBlob = await executePdf({
                body: { billId: billData.id }
            });

            if (pdfBlob)
            {
                const filename = `factura_${billData.billNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
                downloadFile(pdfBlob as Blob, filename);

                toast.success('PDF generado exitosamente', {
                    description: "El archivo se ha descargado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
            else
            {
                toast.error('Error al generar PDF', {
                    description: "No se pudo generar el archivo PDF.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (error)
        {
            console.error('Error generando PDF:', error);
            toast.error('Error generando PDF', {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsGenerating(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Detalles de la Factura</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        <X />
                    </button>
                </div>

                {isLoading || !billData ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando información...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.billContent}>
                            {/* Header de la factura */}
                            <div className={styles.billHeader}>
                                <div className={styles.billInfo}>
                                    <span className={styles.label}>{type === 'order' ? 'Factura' : 'Pedido Personalizado'}</span>
                                    <h3 className={styles.billNumber}>#{billData.billNumber}</h3>
                                    <p className={styles.billDate}>{formatDate(billData.createdAt)}</p>
                                </div>
                                <div className={styles.billTotal}>
                                    <span className={styles.label}>Total</span>
                                    <p className={styles.totalAmount}>{formatPrice(billData.totalPrice)}</p>
                                </div>
                            </div>

                            {/* Información del cliente */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Información del Cliente</h4>
                                <div className={styles.clientDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Nombre:</span>
                                        <span className={styles.detailValue}>{billData.clientName || 'N/A'}</span>
                                    </div>
                                    {billData.clientDocId && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Documento:</span>
                                            <span className={styles.detailValue}>{billData.clientDocType} {billData.clientDocId}</span>
                                        </div>
                                    )}
                                    {billData.clientPhone && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Teléfono:</span>
                                            <span className={styles.detailValue}>{billData.clientPhone}</span>
                                        </div>
                                    )}
                                    {billData.clientEmail && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Email:</span>
                                            <span className={styles.detailValue}>{billData.clientEmail}</span>
                                        </div>
                                    )}
                                    {billData.clientAddress && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Dirección:</span>
                                            <span className={styles.detailValue}>{billData.clientAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Productos */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Productos</h4>
                                <div className={styles.productsTable}>
                                    <div className={styles.tableHeader}>
                                        <span>Producto</span>
                                        <span>Cantidad</span>
                                        <span>Precio Unit.</span>
                                        <span>Total</span>
                                    </div>
                                    {billData.details && billData.details.length > 0 ? (
                                        billData.details.map((detail) => (
                                            <div key={detail.id} className={styles.tableRow}>
                                                <span className={styles.productName}>
                                                    {detail.product?.name || detail.productName || 'Producto'}
                                                </span>
                                                <span className={styles.quantity}>{detail.quantity}</span>
                                                <span className={styles.unitPrice}>
                                                    {formatPrice(detail.unitPrice || 0)}
                                                </span>
                                                <span className={styles.itemTotal}>
                                                    {formatPrice(detail.subtotal || (detail.quantity * Number(detail.unitPrice || 0)))}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.noProducts}>No hay productos registrados</p>
                                    )}
                                </div>
                            </div>

                            {/* Información de pago (solo para orders) */}
                            {type === 'order' && orderData && 'paymentMethod' in orderData && (
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Información de Pago</h4>
                                    <div className={styles.paymentDetails}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Método de Pago:</span>
                                            <span className={styles.detailValue}>{orderData.paymentMethod}</span>
                                        </div>
                                        {orderData.amountReceived && (
                                            <>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Monto Recibido:</span>
                                                    <span className={styles.detailValue}>{formatPrice(orderData.amountReceived)}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Cambio:</span>
                                                    <span className={styles.detailValue}>{formatPrice(orderData.change || 0)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Información de pedido personalizado */}
                            {type === 'customOrder' && orderData && 'depositAmount' in orderData && (
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>Información del Pedido</h4>
                                    <div className={styles.paymentDetails}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Depósito:</span>
                                            <span className={styles.detailValue}>{formatPrice(orderData.depositAmount)}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Monto Restante:</span>
                                            <span className={styles.detailValue}>{formatPrice(orderData.remainingAmount)}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Estado:</span>
                                            <span className={styles.detailValue}>{orderData.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resumen */}
                            <div className={styles.summary}>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Subtotal:</span>
                                    <span className={styles.summaryValue}>{formatPrice(billData.totalPrice)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span className={styles.summaryLabel}>Total:</span>
                                    <span className={styles.summaryValue}>{formatPrice(billData.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className={styles.modalActions}>
                            <button
                                className={styles.printButton}
                                onClick={handleDownloadPdf}
                                disabled={isGenerating}
                            >
                                <Printer />
                                {isGenerating ? 'Generando PDF...' : 'Descargar Factura'}
                            </button>
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

export default OrdersDetailsModal;