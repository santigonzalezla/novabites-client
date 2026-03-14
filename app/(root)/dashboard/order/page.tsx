'use client';

import styles from './page.module.css';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import Orderbar from '@/app/components/order/orderbar/Orderbar';
import OrderCard from '@/app/components/order/ordercard/OrderCard';
import { useEffect, useState } from 'react';
import OrderModal from '@/app/components/order/ordermodal/OrderModal';
import { useFetch } from '@/hooks/useFetch';
import { CustomOrder } from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import AddOrderModal from '@/app/components/order/addordermodal/AddOrderModal';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const Order = () =>
{
    const { user } = useAuth();
    const { isLoading, error, execute } = useFetch<CustomOrder[]>(`/api/custom-order?storeId=${user?.storeId ?? ''}`);
    const [allOrders, setAllOrders] = useState<CustomOrder[]>([]);
    const [statusOrder, setStatusOrder] = useState<StatusOrder | 'all'>('all');
    const [filteredData, setFilteredData] = useState<CustomOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<CustomOrder>();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

    useEffect(() =>
    {
        if (!user?.storeId) return;

        const fetchOrders = async () =>
        {
            const orders = await execute();

            if (orders)
            {
                console.log('storeId del usuario:', user?.storeId);
                console.log('Total pedidos recibidos:', orders.length);
                orders.forEach(o => console.log(`Pedido #${o.numId} - tienda: ${o.store?.id} (${o.store?.name})`));
                setAllOrders(orders);
                setFilteredData(orders);
            }
        }

        fetchOrders();
    }, [user?.storeId]);

    useEffect(() =>
    {
        if (filteredData)
        {
            if (statusOrder === 'all')
            {
                setFilteredData(allOrders);
            }
            else
            {
                const statusFiltered = allOrders.filter(order => order.status === statusOrder);
                setFilteredData(statusFiltered);
            }
        }
    }, [statusOrder]);

    const handleOpenPaymentModal = () =>
    {
        setIsOrderModalOpen(true);
    }

    const handleOpenAddOrderModal = () =>
    {
        setIsAddOrderModalOpen(true);
    }

    const handleSetSelectedOrder = (order: CustomOrder) =>
    {
        setSelectedOrder(order);
        handleOpenPaymentModal();
    }

    const handleSetStatusOrder = (status: StatusOrder | string) =>
    {
        setStatusOrder(status as StatusOrder);
    }

    const handleCancelOrder = async (order: Partial<CustomOrder>) =>
    {
        try
        {
            const updatedOrder = await execute({
                method: 'PATCH',
                body: { status: StatusOrder.CANCELED }
            }, `/api/custom-order/${order.id}`);

            if (!error && updatedOrder)
            {
                toast.success("Pedido cancelado correctamente", {
                    description: "El pedido ha sido cancelado con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const orders = await execute();

                if (orders)
                {
                    setAllOrders(orders);

                    if (statusOrder === 'all') setFilteredData(orders);
                    else setFilteredData(orders.filter(o => o.status === statusOrder));
                }

            }
        }
        catch (e)
        {
            console.error("Error updating order:", e);
            toast.error("Error al cancelar el pedido", {
                description: "Ha ocurrido un error al cancelar el pedido.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleCompleteOrder = async (order: Partial<CustomOrder>) =>
    {
        try
        {
            const updatedOrder = await execute({
                method: 'PATCH',
                body: { status: StatusOrder.COMPLETED }
            }, `/api/custom-order/${order.id}`);

            if (!error && updatedOrder)
            {
                toast.success("Pedido completado correctamente", {
                    description: "El pedido ha sido completado con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const orders = await execute();

                if (orders)
                {
                    setAllOrders(orders);

                    if (statusOrder === 'all') setFilteredData(orders);
                    else setFilteredData(orders.filter(o => o.status === statusOrder));
                }

            }
        }
        catch (e)
        {
            console.error("Error updating order:", e);
            toast.error("Error al completar el pedido", {
                description: "Ha ocurrido un error al completar el pedido.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleSaveNewOrder = async (order: Partial<CustomOrder>, imageFiles?: { detailIndex: number, file: File }[]) =>
    {
        try
        {
            let createdOrder: CustomOrder[] | CustomOrder | null;

            if (imageFiles && imageFiles.length > 0)
            {
                const details = order.details ? [...order.details] : [];
                const reorderedDetails: typeof details = [];
                const orderedFiles: File[] = [];

                const sortedImageFiles = [...imageFiles].sort((a, b) => a.detailIndex - b.detailIndex);
                const imageDetailIndices = new Set(sortedImageFiles.map(f => f.detailIndex));

                sortedImageFiles.forEach(({ detailIndex, file }) =>
                {
                    if (details[detailIndex])
                    {
                        reorderedDetails.push(details[detailIndex]);
                        orderedFiles.push(file);
                    }
                });

                details.forEach((detail, idx) =>
                {
                    if (!imageDetailIndices.has(idx)) reorderedDetails.push(detail);
                });

                const formData = new FormData();
                formData.append('storeId', order.storeId || '');
                formData.append('userId', order.userId || '');
                formData.append('depositAmount', String(order.depositAmount));
                formData.append('remainingAmount', String(order.remainingAmount));
                formData.append('totalPrice', String(order.totalPrice));
                formData.append('deliveryDate', order.deliveryDate as string);
                formData.append('status', order.status || StatusOrder.PENDING);
                formData.append('available', 'true');

                if (order.client) formData.append('client', JSON.stringify(order.client));
                if (reorderedDetails.length > 0) formData.append('details', JSON.stringify(reorderedDetails));
                if (order.products) formData.append('products', JSON.stringify(order.products));

                orderedFiles.forEach(file => formData.append('images', file));

                createdOrder = await execute({
                    method: 'POST',
                    body: formData,
                    isFormData: true
                }, `/api/custom-order`);
            }
            else
            {
                createdOrder = await execute({
                    method: 'POST',
                    body: order
                }, `/api/custom-order`);
            }

            if (!error && createdOrder)
            {
                toast.success("Nuevo pedido creado correctamente", {
                    description: "El nuevo pedido ha sido creado con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const orders = await execute();

                if (orders)
                {
                    setAllOrders(orders);

                    if (statusOrder === 'all') setFilteredData(orders);
                    else setFilteredData(orders.filter(o => o.status === statusOrder));
                }

                handleCloseAddOrderModal();
            }
        }
        catch (e)
        {
            console.error("Error saving new order:", e);
            toast.error("Error al guardar el nuevo pedido", {
                description: "Ha ocurrido un error al guardar el nuevo pedido.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleCloseAddOrderModal = () =>
    {
        setIsAddOrderModalOpen(false);
    }

    const handleClosePaymentModal = () =>
    {
        setIsOrderModalOpen(false);
    }

    return (
        <div className={styles. order}>
            <div className={styles.top}>
                <BackButton />
                <h1>Gestiona tus Pedidos!</h1>
            </div>
            <div className={styles.orderoptions}>
                <Orderbar
                    setStatusOrder={handleSetStatusOrder}
                    statusOrder={statusOrder}
                />
                <button onClick={handleOpenAddOrderModal}>Agregar Pedido</button>
            </div>
            <div className={styles.grid}>
                {filteredData?.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Aún no se han registrado pedidos</p>
                    </div>
                ) : (
                    filteredData?.map((orderData, index) => (
                        <OrderCard
                            index={index}
                            customOrder={orderData}
                            key={index}
                            setSelectedOrder={handleSetSelectedOrder}
                            onCompleteOrder={handleCompleteOrder}
                        />
                    ))
                )}
            </div>

            {isOrderModalOpen && (
                <OrderModal
                    customOrder={selectedOrder ? selectedOrder : {} as CustomOrder}
                    onCancel={handleCancelOrder}
                    closeModal={handleClosePaymentModal}
                    onCompleteOrder={handleCompleteOrder}
                />
            )}

            <AddOrderModal isOpen={isAddOrderModalOpen} onClose={handleCloseAddOrderModal} onSave={handleSaveNewOrder} />
        </div>
    );
}

export default Order;