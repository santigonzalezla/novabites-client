'use client';

import styles from './ordermodal.module.css';
import OrderDetails from '@/app/components/order/orderdetails/OrderDetails';
import OrderPad from '@/app/components/order/orderpad/OrderPad';
import { CustomOrder, Product } from '@/interfaces/interfaces';
import React, { useState } from 'react';
import BillGenerator from '@/app/components/sales/billgenerator/BillGenerator';
import OrdersDetailsModal from '@/app/components/orderslist/ordersdetailsmodal/OrdersDetailsModal';

interface OrderModalProps {
    customOrder: CustomOrder;
    onCancel: (order: Partial<CustomOrder>) => void;
    closeModal: () => void
    onCompleteOrder: (order: CustomOrder) => void;
}

const OrderModal = ({ customOrder, closeModal, onCancel, onCompleteOrder }: OrderModalProps) =>
{
    const [ isEditing, setIsEditing ] = useState(false);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

    const handleCompleteOrder = async (order: CustomOrder) =>
    {
        onCompleteOrder(order);
        setCompletedOrderId(order.id);
        setShowOrderDetails(true);
        console.log("Completed order:", order);
        console.log(completedOrderId, showOrderDetails);
    };

    const handleCloseOrderDetails = () =>
    {
        setShowOrderDetails(false);
        setCompletedOrderId(null);
        closeModal();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) closeModal();
    };

    if (showOrderDetails && completedOrderId)
    {
        return (
            <OrdersDetailsModal
                orderId={completedOrderId}
                type="customOrder"
                onClose={handleCloseOrderDetails}
            />
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <OrderDetails
                onCancel={onCancel}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                customOrder={customOrder}
                onCompleteOrder={handleCompleteOrder}
                closeModal={closeModal}
            />
            {isEditing && (<OrderPad />)}
        </div>
    );
}

export default OrderModal;