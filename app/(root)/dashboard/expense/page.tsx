'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './page.module.css';
import { Order, DailyExpense } from '@/interfaces/interfaces';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import ExpensesTable from '@/app/components/expenses/expensestable/ExpensesTable';
import ExpensesModal from '@/app/components/expenses/expensesmodal/ExpensesModal';
import { getMaxDate, getTodayLocal, isToday, localToUTC } from '@/lib/dateUtils';

interface ProductSummary {
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
}

export interface PendingExpense {
    tempId: string;
    category: string;
    description: string;
    amount: string;
}

const DailySalesReport = () =>
{
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(getTodayLocal());
    const [orders, setOrders] = useState<Order[]>([]);
    const [expenses, setExpenses] = useState<DailyExpense[]>([]);
    const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
    const [showClosingModal, setShowClosingModal] = useState(false);
    const [closingsCount, setClosingsCount] = useState(0);
    const { error: ordersError, isLoading: ordersLoading, execute: fetchOrders } = useFetch<Order[]>(
        `/api/order?storeId=${user?.storeId}&date=${localToUTC(selectedDate)}`,
        { immediate: false }
    );
    const { error: expensesError, isLoading: expensesLoading, execute: fetchExpenses } = useFetch<DailyExpense[]>(
        `/api/daily-expense?storeId=${user?.storeId}&date=${localToUTC(selectedDate)}`,
        { immediate: false }
    );
    const { execute: fetchClosingsCount } = useFetch<{ count: number }>(
        `/api/cash-closing/count/${user?.storeId}/${localToUTC(selectedDate)}`,
        { immediate: false }
    );

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            if (user?.storeId)
            {
                const ordersData = await fetchOrders();
                if (ordersData) setOrders(ordersData);

                const expensesData = await fetchExpenses();
                if (expensesData) setExpenses(expensesData);

                const closingsData = await fetchClosingsCount();
                if (closingsData) setClosingsCount(closingsData.count);
            }
        };

        fetchData();
        setPendingExpenses([]);
    }, [user?.storeId, selectedDate]);

    const productsSummary = useMemo(() =>
    {
        const summary: { [key: string]: ProductSummary } = {};

        orders.forEach(order =>
        {
            order.details?.forEach(detail => {
                const productId = detail.productId || 'unknown';
                const productName = detail.product?.name || 'Producto desconocido';
                const quantity = detail.quantity;
                const price = typeof detail.price === 'string' ? parseFloat(detail.price) : detail.price;

                if (!summary[productId]) summary[productId] = { productId, productName, quantitySold: 0, totalRevenue: 0 };

                summary[productId].quantitySold += quantity;
                summary[productId].totalRevenue += price;
            });
        });

        return Object.values(summary);
    }, [orders]);

    const totalRevenue = useMemo(() =>
    {
        return orders.reduce((sum, order) =>
        {
            const price = typeof order.totalPrice === 'string' ? parseFloat(order.totalPrice) : order.totalPrice;
            return sum + price;
        }, 0);
    }, [orders]);

    const totalExpenses = useMemo(() =>
    {
        const savedExpenses = expenses.reduce((sum, expense) =>
        {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
            return sum + amount;
        }, 0);

        const pendingTotal = pendingExpenses.reduce((sum, expense) =>
        {
            const amount = parseFloat(expense.amount) || 0;
            return sum + amount;
        }, 0);

        return savedExpenses + pendingTotal;
    }, [expenses, pendingExpenses]);

    const netProfit = totalRevenue - totalExpenses;

    const formatPrice = (price: number) =>
    {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
    };

    const formatDate = (date: string) =>
    {
        const [year, month, day] = date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric" }).format(localDate);
    };

    const handleClosingComplete = (savedExpenses: DailyExpense[]) =>
    {
        setExpenses([...expenses, ...savedExpenses]);
        setPendingExpenses([]);
        setClosingsCount(prev => prev + 1);
    };

    const isTodaySelected = isToday(selectedDate);
    const canPerformClosing = isTodaySelected && orders.length > 0;

    if (ordersError || expensesError)
    {
        return (
            <div className={styles.dailySales}>
                <div className={styles.content}>
                    <p>Error al cargar los datos</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dailySales}>
            <div className={styles.top}>
                <BackButton />
                <h1>Reporte de Ventas Diarias</h1>
                <button
                    className={styles.closingButton}
                    onClick={() => setShowClosingModal(true)}
                    disabled={!canPerformClosing}
                    title={!isTodaySelected ? 'Solo puedes hacer cierre de caja del día actual' : !orders.length ? 'No hay órdenes para cerrar' : ''}
                >
                    📊 Realizar Cierre de Caja
                    {closingsCount > 0 && ` (${closingsCount})`}
                </button>
            </div>

            <div className={styles.content}>
                {!isTodaySelected && (
                    <div className={styles.warningMessage}>
                        ⚠️ Estás viendo el historial del {formatDate(selectedDate)}. Solo puedes realizar cierres de caja del día actual.
                    </div>
                )}

                {isTodaySelected && closingsCount > 0 && (
                    <div className={styles.infoMessage}>
                        ℹ️ Ya se han realizado {closingsCount} cierre(s) de caja hoy. Los productos mostrados son desde el último cierre.
                    </div>
                )}
                {/* Selector de fecha */}
                <div className={styles.dateSelector}>
                    <Calendar />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.dateInput}
                        max={getMaxDate()}
                    />
                    <span className={styles.dateLabel}>{formatDate(selectedDate)}</span>
                </div>

                {/* Cards de resumen */}
                <div className={styles.summaryCards}>
                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon}>
                            <TrendingUp />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Ingresos del Día</span>
                            <span className={styles.cardValue}>{formatPrice(totalRevenue)}</span>
                            <span className={styles.cardSubtext}>{orders.length} órdenes</span>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon}>
                            <TrendingDown />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Gastos del Día</span>
                            <span className={styles.cardValue}>{formatPrice(totalExpenses)}</span>
                            <span className={styles.cardSubtext}>{expenses.length} gastos</span>
                        </div>
                    </div>

                    <div className={`${styles.summaryCard} ${netProfit >= 0 ? styles.positive : styles.negative}`}>
                        <div className={styles.cardIcon}>
                            <DollarSign />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Ganancia Neta</span>
                            <span className={styles.cardValue}>{formatPrice(netProfit)}</span>
                            <span className={styles.cardSubtext}>
                                {netProfit >= 0 ? 'Positivo' : 'Negativo'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabla de productos vendidos */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Productos Vendidos</h2>
                    {ordersLoading ? (
                        <p>Cargando productos...</p>
                    ) : productsSummary.length === 0 ? (
                        <p className={styles.emptyMessage}>No hay productos vendidos en esta fecha</p>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.productsTable}>
                                <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad Vendida</th>
                                    <th>Total Generado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {productsSummary.map((product) => (
                                    <tr key={product.productId}>
                                        <td>{product.productName}</td>
                                        <td className={styles.centerText}>{product.quantitySold}</td>
                                        <td className={styles.rightText}>{formatPrice(product.totalRevenue)}</td>
                                    </tr>
                                ))}
                                <tr className={styles.totalRow}>
                                    <td><strong>Total</strong></td>
                                    <td className={styles.centerText}>
                                        <strong>
                                            {productsSummary.reduce((sum, p) => sum + p.quantitySold, 0)}
                                        </strong>
                                    </td>
                                    <td className={styles.rightText}>
                                        <strong>{formatPrice(totalRevenue)}</strong>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Tabla de gastos */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Gastos Fijos y Operacionales</h2>
                    <ExpensesTable
                        expenses={expenses}
                        setExpenses={setExpenses}
                        pendingExpenses={pendingExpenses}
                        setPendingExpenses={setPendingExpenses}
                        storeId={user?.storeId || ''}
                        selectedDate={selectedDate}
                        isLoading={expensesLoading}
                        isToday={isTodaySelected}
                    />
                </div>
            </div>

            {showClosingModal && (
                <ExpensesModal
                    onClose={() => setShowClosingModal(false)}
                    orders={orders}
                    selectedDate={selectedDate}
                    pendingExpenses={pendingExpenses}
                    onClosingComplete={handleClosingComplete}
                    closingsCount={closingsCount}
                />
            )}
        </div>
    );
};

export default DailySalesReport;