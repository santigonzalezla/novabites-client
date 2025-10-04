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

const Order = () =>
{
    const { isLoading, error, execute } = useFetch<CustomOrder[]>('/api/custom-order');
    const [allOrders, setAllOrders] = useState<CustomOrder[]>([]);
    const [statusOrder, setStatusOrder] = useState<StatusOrder | 'all'>('all');
    const [filteredData, setFilteredData] = useState<CustomOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<CustomOrder>();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

    useEffect(() =>
    {
        const fetchOrders = async () =>
        {
            const orders = await execute();

            if (orders)
            {
                console.log(orders);
                setAllOrders(orders);
                setFilteredData(orders);
            }
        }

        fetchOrders();
    }, []);

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

    const handleSaveNewOrder = async (order: Partial<CustomOrder>) =>
    {
        try
        {
            const createdOrder = await execute({
                method: 'POST',
                body: order
            }, `/api/custom-order`);

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
                {filteredData?.map((orderData, index) => (
                    <OrderCard
                        index={index}
                        customOrder={orderData}
                        key={index}
                        setSelectedOrder={handleSetSelectedOrder}
                        onCompleteOrder={handleCompleteOrder}
                    />
                ))}
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