'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Topbar from '@/app/components/dashboard/topbar/Topbar';
import { Order, CustomOrder, PaginatedResponse } from '@/interfaces/interfaces';
import { Calendar, IdCard, Phone, User } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import OrdersDetailsModal from '@/app/components/orderslist/ordersdetailsmodal/OrdersDetailsModal';
import BackButton from '@/app/components/shared/backbutton/BackButton';

interface BillItem {
    id: string;
    billNumber: string;
    totalPrice: number | string;
    clientName: string;
    clientDocType?: string;
    clientDocId?: string;
    clientPhone?: string;
    dueDate?: Date | string;
    type: 'order' | 'customOrder';
}

const LIMIT = 10;

const toBillItem = (item: Order | CustomOrder, type: 'order' | 'customOrder'): BillItem => ({
    id: item.id,
    billNumber: `${type === 'order' ? 'ORD' : 'CUST'}-${item.numId}`,
    totalPrice: item.totalPrice,
    clientName: item.client?.name || 'Cliente sin nombre',
    clientDocType: item.client?.typeId,
    clientDocId: item.client?.docId,
    clientPhone: item.client?.phone,
    dueDate: item.createdAt,
    type,
});

const OrdersList = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'order' | 'customOrder'>('order');
    const [orderPage, setOrderPage] = useState(1);
    const [customOrderPage, setCustomOrderPage] = useState(1);
    const [orderResponse, setOrderResponse] = useState<PaginatedResponse<Order> | null>(null);
    const [customOrderResponse, setCustomOrderResponse] = useState<PaginatedResponse<CustomOrder> | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; type: 'order' | 'customOrder' } | null>(null);
    const { error, isLoading, execute } = useFetch<PaginatedResponse<Order>>('/api/order', {
        immediate: false
    });
    const { error: orderError, isLoading: isLoadingCustom, execute: orderExecute } = useFetch<PaginatedResponse<CustomOrder>>('/api/custom-order', {
        immediate: false
    });

    useEffect(() =>
    {
        if (!user?.storeId) return;

        const fetchOrders = async () =>
        {
            const qs = new URLSearchParams({ storeId: user.storeId, page: String(orderPage), limit: String(LIMIT) }).toString();
            const result = await execute({}, `/api/order?${qs}`);
            if (result) setOrderResponse(result);
        }

        fetchOrders();
    }, [orderPage, user?.storeId]);

    useEffect(() =>
    {
        if (!user?.storeId) return;

        const fetchCustomOrders = async () =>
        {
            const qs = new URLSearchParams({ storeId: user.storeId, page: String(customOrderPage), limit: String(LIMIT) }).toString();
            const result = await orderExecute({}, `/api/custom-order?${qs}`);
            if (result) setCustomOrderResponse(result);
        }

        fetchCustomOrders();
    }, [customOrderPage, user?.storeId]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    }

    const formatDate = (date: Date | string | undefined) =>
    {
        if (!date) return "N/A";
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric" }).format(dateObj);
    }

    if (error || orderError) {
        return (
            <div className={styles.bills}>
                <Topbar />
                <div className={styles.content}>
                    <p>Error al cargar las facturas</p>
                </div>
            </div>
        );
    }

    const activeResponse = activeTab === 'order' ? orderResponse : customOrderResponse;
    const activePage = activeTab === 'order' ? orderPage : customOrderPage;
    const setActivePage = activeTab === 'order' ? setOrderPage : setCustomOrderPage;
    const activeItems: BillItem[] = (activeResponse?.data ?? []).map((item) => toBillItem(item, activeTab));
    const totalItems = activeResponse?.meta.total ?? 0;
    const totalPages = activeResponse?.meta.totalPages ?? 1;
    const isLoadingActive = activeTab === 'order' ? isLoading : isLoadingCustom;

    return (
        <div className={styles.bills}>
            <div className={styles.top}>
                <BackButton />
                <h1>Gestiona tus Facturas!</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Listado de Facturas</h1>
                    <p className={styles.subtitle}>
                        {totalItems} {totalItems === 1 ? "factura" : "facturas"} registradas
                    </p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'order' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('order')}
                    >
                        Órdenes
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'customOrder' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('customOrder')}
                    >
                        Pedidos personalizados
                    </button>
                </div>

                {isLoadingActive ? (
                    <div className={styles.content}>
                        <p>Cargando facturas...</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {activeItems.length === 0 ? (
                            <p>No hay facturas registradas</p>
                        ) : (
                            activeItems.map((order) => (
                                <div key={order.id} className={styles.billCard}>
                                    <div className={styles.billHeader}>
                                        <div className={styles.billNumber}>
                                        <span className={styles.label}>
                                            {order.type === 'order' ? 'Orden' : 'Orden Personalizado'}
                                        </span>
                                            <span className={styles.number}>{order.billNumber}</span>
                                        </div>
                                        <div className={styles.billPrice}>{formatPrice(order.totalPrice)}</div>
                                    </div>

                                    <div className={styles.billBody}>
                                        <div className={styles.clientInfo}>
                                            <div className={styles.infoRow}>
                                                <User />
                                                <span className={styles.clientName}>{order.clientName}</span>
                                            </div>

                                            {order.clientDocId && (
                                                <div className={styles.infoRow}>
                                                    <IdCard />
                                                    <span className={styles.docType}>{order.clientDocType}:</span>
                                                    <span className={styles.docId}>{order.clientDocId}</span>
                                                </div>
                                            )}

                                            {order.clientPhone && (
                                                <div className={styles.infoRow}>
                                                    <Phone />
                                                    <span>{order.clientPhone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.billFooter}>
                                            <div className={styles.dueDate}>
                                                <Calendar />
                                                <span>Fecha: {formatDate(order.dueDate)}</span>
                                            </div>

                                            <button
                                                className={styles.viewButton}
                                                onClick={() => setSelectedOrder({ id: order.id, type: order.type })}
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

                {totalItems > 0 && (
                    <div className={styles.pagination}>
                        <span className={styles.paginationInfo}>
                            Página {activePage} de {totalPages}
                        </span>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.paginationButton}
                                disabled={activePage <= 1}
                                onClick={() => setActivePage(activePage - 1)}
                            >
                                &lt;
                            </button>
                            <button
                                className={styles.paginationButton}
                                disabled={activePage >= totalPages}
                                onClick={() => setActivePage(activePage + 1)}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrdersDetailsModal
                    orderId={selectedOrder.id}
                    type={selectedOrder.type}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}

export default OrdersList;
