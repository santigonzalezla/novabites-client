'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Topbar from '@/app/components/dashboard/topbar/Topbar';
import { Order, CustomOrder } from '@/interfaces/interfaces';
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

const OrdersList = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
    const [ordersList, setOrdersList] = useState<BillItem[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; type: 'order' | 'customOrder' } | null>(null);
    const { error, isLoading, execute } = useFetch(`/api/order?storeId=${user?.storeId}`, {
        immediate: false
    });
    const { error: orderError, execute: orderExecute } = useFetch(`/api/custom-order?storeId=${user?.storeId}`, {
        immediate: false
    });

    useEffect(() => 
    {
        const fetchOrders = async () => 
        {
            const ordersData = await execute();
            if (ordersData) setOrders(ordersData);

            const customOrdersData = await orderExecute();
            if (customOrdersData) setCustomOrders(customOrdersData);
        }

        fetchOrders();
    }, []);

    useEffect(() =>
    {
        const combinedBills: BillItem[] = [];

        orders.forEach((order) =>
        {
            combinedBills.push({
                id: order.id,
                billNumber: `ORD-${order.numId}`,
                totalPrice: order.totalPrice,
                clientName: order.client?.name || 'Cliente sin nombre',
                clientDocType: order.client?.typeId,
                clientDocId: order.client?.docId,
                clientPhone: order.client?.phone,
                dueDate: order.createdAt,
                type: 'order'
            });
        });
        
        customOrders.forEach((customOrder) => 
        {
            combinedBills.push({
                id: customOrder.id,
                billNumber: `CUST-${customOrder.numId}`,
                totalPrice: customOrder.totalPrice,
                clientName: customOrder.client?.name || 'Cliente sin nombre',
                clientDocType: customOrder.client?.typeId,
                clientDocId: customOrder.client?.docId,
                clientPhone: customOrder.client?.phone,
                dueDate: customOrder.createdAt,
                type: 'customOrder'
            });
        });
        
        combinedBills.sort((a, b) => 
        {
            const dateA = new Date(a.dueDate || 0).getTime();
            const dateB = new Date(b.dueDate || 0).getTime();
            return dateB - dateA;
        });

        setOrdersList(combinedBills);
    }, [orders, customOrders]);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    }

    const formatDate = (date: Date | string | undefined) => 
    {
        if (!date) return "N/A";
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric" }).format(dateObj);
    }

    if (isLoading) {
        return (
            <div className={styles.bills}>
                <Topbar />
                <div className={styles.content}>
                    <p>Cargando facturas...</p>
                </div>
            </div>
        );
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
                        {ordersList.length} {ordersList.length === 1 ? "factura" : "facturas"} registradas
                    </p>
                </div>

                <div className={styles.list}>
                    {ordersList.length === 0 ? (
                        <p>No hay facturas registradas</p>
                    ) : (
                        ordersList.map((order) => (
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