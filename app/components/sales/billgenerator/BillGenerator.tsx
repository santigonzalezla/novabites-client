"use client"

import styles from "./billgenerator.module.css"
import { useEffect, useState } from "react"
import type { Bill, Product } from '@/interfaces/interfaces';
import { Printer } from '@/app/components/svg';
import { toast } from 'sonner';
import { useFetch } from '@/hooks/useFetch';

interface BillGeneratorProps {
    orderData: {
        orderId: string
        total: string
        paymentMethod: string
        amountReceived?: string
        change?: string
    }
    cartItems: Partial<Product>[]
    quantities: { [productId: string]: number }
    onClose: () => void
    isCustomOrder?: boolean
}

const BillGenerator = ({ orderData, cartItems, quantities, onClose, isCustomOrder }: BillGeneratorProps) =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [billData, setBillData] = useState<Bill | null>(null);
    const billEndpoint = isCustomOrder
        ? `/api/bill/custom-order/${orderData.orderId}`
        : `/api/bill/order/${orderData.orderId}`;

    const { execute: executeOrder } = useFetch<Bill>(billEndpoint, {
        immediate: false,
    });
    const { execute: executePdf } = useFetch<Blob>('/api/bill/generate', {
        immediate: false,
        responseType: 'blob',
        method: 'POST'
    });

    useEffect(() =>
    {
        const fetchBill = async () =>
        {
            const bill = await executeOrder();

            if (bill)
            {
                setBillData(bill);
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

        fetchBill();
    }, []);

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
        setIsGenerating(true);

        try
        {
            if (!billData)
            {
                toast.error('No se encontró la factura para esta orden', {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                setIsGenerating(false);
                return;
            }

            const pdfBlob = await executePdf({
                body: { billId: billData.id }
            });

            if (pdfBlob)
            {
                const filename = `factura_${billData.billNumber || billData.id}_${new Date().toISOString().split('T')[0]}.pdf`;

                downloadFile(pdfBlob as Blob, filename);

                toast.success('PDF generado exitosamente', {
                    description: "El archivo se ha descargado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                onClose();
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
                    <h2>Resumen de Compra</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                {!billData ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando factura...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.billContent}>
                            <div className={styles.billHeader}>
                                <h3>Factura #{billData.billNumber || orderData.orderId}</h3>
                                <p className={styles.billDate}>
                                    {new Date(billData.createdAt || new Date()).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>

                            <div className={styles.billItems}>
                                <div className={styles.itemsHeader}>
                                    <span>Producto</span>
                                    <span>Cant.</span>
                                    <span>Precio</span>
                                    <span>Total</span>
                                </div>

                                {cartItems.map((item, index) => (
                                    <div key={index} className={styles.billItem}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemQuantity}>{quantities[item.id!] || 0}</span>
                                        <span className={styles.itemPrice}>${item.basePrice}</span>
                                        <span className={styles.itemTotal}>
                                            ${(Number(item.basePrice) * (quantities[item.id!] || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.billSummary}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>${orderData.total}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Método de Pago</span>
                                    <span>{orderData.paymentMethod}</span>
                                </div>
                                {orderData.amountReceived && (
                                    <>
                                        <div className={styles.summaryRow}>
                                            <span>Monto Recibido</span>
                                            <span>${orderData.amountReceived}</span>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>Cambio</span>
                                            <span>${orderData.change}</span>
                                        </div>
                                    </>
                                )}
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>Total</span>
                                    <span>${orderData.total}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.printButton}
                                onClick={handleDownloadPdf}
                                disabled={isGenerating || !billData}
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

export default BillGenerator