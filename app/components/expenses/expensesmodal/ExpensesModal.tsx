'use client';

import { MouseEvent, useEffect, useState } from 'react';
import styles from './expensesmodal.module.css';
import { DailyExpense, Order, Product, StoreProduct } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { RequestStatus, RequestType, TypeStore } from '@/interfaces/enums';
import ModalTable, { StoreRequestItem } from '@/app/components/inventory/modaltable/ModalTable';
import mockData from '@/app/components/shared/data/mockData.json';
import { X } from '@/app/components/svg';
import { PendingExpense } from '@/app/(root)/dashboard/expense/page';
import { formatDateLocal, formatTimeLocal, isAfter } from '@/lib/dateUtils';

interface ClosingModalProps {
    onClose: () => void;
    orders: Order[];
    selectedDate: string;
    pendingExpenses: PendingExpense[];
    onClosingComplete: (savedExpenses: DailyExpense[]) => void;
    closingsCount: number;
}

interface ProductSold {
    productId: string;
    productName: string;
    quantitySold: number;
}

interface LastClosing {
    id: string;
    createdAt: string;
    orders: {
        order: {
            id: string;
            createdAt: string;
        };
    }[];
}

const ExpensesModal = ({ onClose, orders, selectedDate, pendingExpenses, onClosingComplete, closingsCount }: ClosingModalProps) =>
{
    const { user } = useAuth();
    const [closingNote, setClosingNote] = useState('');
    const [storeRequestData, setStoreRequestData] = useState<StoreRequestItem[]>([]);
    const [productsSold, setProductsSold] = useState<ProductSold[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastClosingTime, setLastClosingTime] = useState<Date | null>(null);

    const { data: storeData } = useFetch('/api/store');
    const { isLoading: isLoadingProducts, execute: executeProducts } = useFetch<Product[]>('/api/product', { immediate: false });
    const { execute: executeStoreRequest } = useFetch('/api/store-request', { immediate: false });
    const { execute: executeExpense } = useFetch('/api/daily-expense', { immediate: false });
    const { execute: executeCashClosing } = useFetch('/api/cash-closing', { immediate: false });
    const { execute: executeLastClosing } = useFetch<LastClosing>(
        `/api/cash-closing/last-of-day/${user?.storeId}/${selectedDate}`,
        { immediate: false }
    );

    useEffect(() =>
    {
        const fetchProducts = async () =>
        {
            let lastClosingData: LastClosing | null = null;

            if (closingsCount > 0)
            {
                lastClosingData = await executeLastClosing();
                if (lastClosingData) setLastClosingTime(new Date(lastClosingData.createdAt));
            }

            const products = await executeProducts();
            if (products)
            {
                setAllProducts(products);

                let filteredOrders = orders;

                if (lastClosingData && lastClosingData.createdAt)
                {
                    const lastClosingDate = new Date(lastClosingData.createdAt);

                    filteredOrders = orders.filter(order => isAfter(order.createdAt, lastClosingData.createdAt));
                }

                const soldProducts: { [key: string]: ProductSold } = {};

                filteredOrders.forEach(order =>
                {
                    order.details?.forEach(detail =>
                    {
                        if (detail.productId)
                        {
                            if (!soldProducts[detail.productId])
                            {
                                soldProducts[detail.productId] = {
                                    productId: detail.productId,
                                    productName: detail.product?.name || 'Producto desconocido',
                                    quantitySold: 0
                                };
                            }
                            soldProducts[detail.productId].quantitySold += detail.quantity;
                        }
                    });
                });

                const soldList = Object.values(soldProducts);
                setProductsSold(soldList);

                if (soldList.length > 0)
                {
                    const preloadedData = soldList.map(sold =>
                    {
                        const product = products.find(p => p.id === sold.productId);
                        if (!product) return null;

                        return { product: product, requestStock: sold.quantitySold, returnReason: undefined };
                    }).filter(item => item !== null);

                    setStoreRequestData(preloadedData as StoreRequestItem[]);
                }
            }
        };

        fetchProducts();
    }, []);

    const handleOverlayClick = () => (!isSubmitting) && onClose();
    const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();
    const handleDataChange = (newData: StoreRequestItem[]) => setStoreRequestData(newData);

    const isDataComplete = (): boolean =>
    {
        if (storeRequestData.length === 0) return false;

        return storeRequestData.every(item =>
        {
            const hasProduct = item.product && item.product.id && item.product.id !== '';
            const hasQuantity = item.requestStock && item.requestStock > 0;
            return hasProduct && hasQuantity;
        });
    };

    const validatePendingExpenses = (): boolean =>
    {
        if (pendingExpenses.length === 0) return true;

        return pendingExpenses.every(expense =>
        {
            const hasDescription = expense.description.trim() !== '';
            const hasAmount = expense.amount && parseFloat(expense.amount) > 0;
            return hasDescription && hasAmount;
        });
    };

    const calculateTotals = () =>
    {
        const totalRevenue = orders.reduce((sum, order) =>
        {
            const price = typeof order.totalPrice === 'string' ? parseFloat(order.totalPrice) : order.totalPrice;
            return sum + price;
        }, 0);

        const totalExpenses = pendingExpenses.reduce((sum, expense) =>
        {
            return sum + (parseFloat(expense.amount) || 0);
        }, 0);

        const netProfit = totalRevenue - totalExpenses;

        return { totalRevenue, totalExpenses, netProfit };
    };

    const handleSubmitClosing = async () =>
    {
        if (!closingNote.trim())
        {
            toast.error('Descripción requerida', {
                description: 'Debes agregar una descripción del cierre de caja',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        if (!isDataComplete())
        {
            toast.error('Solicitud incompleta', {
                description: 'Debes completar todos los campos de la solicitud de productos',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        if (!validatePendingExpenses())
        {
            toast.error('Gastos incompletos', {
                description: 'Debes completar todos los campos de los gastos pendientes',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        setIsSubmitting(true);

        try
        {
            const savedExpenses: DailyExpense[] = [];

            if (pendingExpenses.length > 0)
            {
                for (const expense of pendingExpenses)
                {
                    const newExpense = {
                        category: expense.category,
                        description: expense.description,
                        amount: parseFloat(expense.amount),
                        expenseDate: new Date(selectedDate).toISOString(),
                        storeId: user?.storeId,
                        userId: user?.userId
                    }

                    const saved = await executeExpense({
                        method: 'POST',
                        body: {
                            storeId: user?.storeId,
                            userId: user?.userId,
                            category: expense.category,
                            description: expense.description,
                            amount: String(expense.amount),
                            expenseDate: new Date(selectedDate).toISOString()
                        }
                    });

                    if (saved) savedExpenses.push(saved);
                }
            }

            const details = storeRequestData.map((item: any) => ({
                productId: item.product.id,
                requestedQuantity: item.requestStock,
                unitPrice: item.product.basePrice,
                totalPrice: (item.product.basePrice as number) * item.requestStock
            }));

            const centralStore = storeData?.find((store: any) => store.type === TypeStore.PRINCIPAL);

            if (!centralStore) throw new Error('No se encontró la tienda central');

            const storeRequest = {
                type: RequestType.SUPPLY_REQUEST,
                status: RequestStatus.PENDING,
                requestingStoreId: user?.storeId,
                requestingUserId: user?.userId,
                targetStoreId: centralStore.id,
                requestedDate: new Date().toISOString(),
                details: details
            };

            const newStoreRequest = await executeStoreRequest({
                method: 'POST',
                body: storeRequest
            });

            if (!newStoreRequest) throw new Error('Error al crear la solicitud de reposición');

            const { totalRevenue, totalExpenses, netProfit } = calculateTotals();

            const cashClosingData = {
                storeId: user?.storeId,
                userId: user?.userId,
                closingDate: selectedDate,
                description: closingNote,
                totalOrders: orders.length,
                totalRevenue: totalRevenue,
                totalExpenses: totalExpenses,
                netProfit: netProfit,
                storeRequestId: newStoreRequest.id,
                orderIds: orders.map(order => order.id),
                expenseIds: savedExpenses.map(expense => expense.id)
            };

            const cashClosing = await executeCashClosing({
                method: 'POST',
                body: cashClosingData
            });

            if (cashClosing)
            {
                toast.success('Cierre de caja realizado exitosamente', {
                    description: `
                        Solicitud de reposición: ${storeRequestData.length} productos
                        ${savedExpenses.length > 0 ? `\nGastos guardados: ${savedExpenses.length}` : ''}
                        \nCierre #${cashClosing.numId} registrado
                    `,
                    duration: 5000,
                    richColors: true,
                    position: 'top-right'
                });

                onClosingComplete(savedExpenses);
                onClose();
            }
        }
        catch (error)
        {
            console.error('Error al realizar cierre de caja:', error);
            toast.error('Error al procesar cierre', {
                description: 'No se pudo completar el cierre de caja',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (amount: string) =>
    {
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numAmount);
    };

    const totalPendingExpenses = pendingExpenses.reduce((sum, exp) =>
    {
        return sum + (parseFloat(exp.amount) || 0);
    }, 0);

    const categoryLabels: Record<string, string> = {
        'RENT': 'Arriendo',
        'UTILITIES': 'Servicios Públicos',
        'SERVICES': 'Servicios',
        'MAINTENANCE': 'Mantenimiento',
        'SUPPLIES': 'Suministros',
        'OTHER': 'Otro'
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={handleContainerClick}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div>
                        <h2>Cierre de Caja - {formatDateLocal(selectedDate)}</h2>
                        <p>Revisa los productos vendidos, gastos pendientes y genera la solicitud de reposición</p>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <X />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {closingsCount > 0 && lastClosingTime && (
                        <div className={styles.infoAlert}>
                            <span className={styles.infoIcon}>ℹ️</span>
                            <div>
                                <strong>Cierre parcial del día</strong>
                                <p>
                                    Este es el cierre #{closingsCount + 1} del día. Los productos mostrados corresponden
                                    a las ventas realizadas después de las {formatTimeLocal(lastClosingTime)}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resumen del día */}
                    <div className={styles.summarySection}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total de órdenes</span>
                            <span className={styles.summaryValue}>{orders.length}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Productos vendidos</span>
                            <span className={styles.summaryValue}>{productsSold.length}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Unidades totales</span>
                            <span className={styles.summaryValue}>
                                {productsSold.reduce((sum, p) => sum + p.quantitySold, 0)}
                            </span>
                        </div>
                        {pendingExpenses.length > 0 && (
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Gastos pendientes</span>
                                <span className={styles.summaryValue}>{pendingExpenses.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Nota de cierre */}
                    <div className={styles.noteSection}>
                        <label htmlFor="closingNote">Descripción del Cierre *</label>
                        <textarea
                            id="closingNote"
                            value={closingNote}
                            onChange={(e) => setClosingNote(e.target.value)}
                            placeholder="Escribe una descripción del cierre de caja (ej: Cierre normal del día, sin novedades)"
                            className={styles.noteTextarea}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Gastos pendientes (si existen) */}
                    {pendingExpenses.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                Gastos Pendientes de Guardar ({pendingExpenses.length})
                            </h3>
                            <div className={styles.expensesList}>
                                {pendingExpenses.map((expense) => (
                                    <div key={expense.tempId} className={styles.expenseItem}>
                                        <div className={styles.expenseInfo}>
                                            <span className={styles.expenseCategory}>
                                                {categoryLabels[expense.category]}
                                            </span>
                                            <span className={styles.expenseDescription}>
                                                {expense.description || <em>Sin descripción</em>}
                                            </span>
                                        </div>
                                        <span className={styles.expenseAmount}>
                                            {formatPrice(expense.amount)}
                                        </span>
                                    </div>
                                ))}
                                <div className={styles.expensesTotal}>
                                    <span>Total gastos pendientes:</span>
                                    <strong>{formatPrice(totalPendingExpenses.toString())}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabla de solicitud */}
                    <div className={styles.tableSection}>
                        <div className={styles.tableHeader}>
                            <h3>Solicitud de Reposición</h3>
                            <p>Productos que necesitan reposición según las ventas del día</p>
                        </div>
                        <div className={styles.tableWrapper}>
                            {isLoadingProducts ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.spinner}></div>
                                    <p>Cargando productos...</p>
                                </div>
                            ) : (
                                <ModalTable
                                    data={storeRequestData}
                                    products={allProducts}
                                    config={mockData.storeRequest.config}
                                    onDataChange={handleDataChange}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.modalActions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        className={styles.submitButton}
                        onClick={handleSubmitClosing}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Procesando...' : 'Generar Cierre de Caja'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpensesModal;