'use client';

import styles from './ordermodal.module.css';
import OrderDetails from '@/app/components/order/orderdetails/OrderDetails';
import OrderPad from '@/app/components/order/orderpad/OrderPad';
import { CustomOrder } from '@/interfaces/interfaces';
import React, { useState } from 'react';

interface OrderModalProps {
    customOrder: CustomOrder;
    onCancel: (order: Partial<CustomOrder>) => void;
    closeModal: () => void
    onCompleteOrder: (order: CustomOrder) => void;
}

const OrderModal = ({ customOrder, closeModal, onCancel, onCompleteOrder }: OrderModalProps) =>
{
    const [ isEditing, setIsEditing ] = useState(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) closeModal();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <OrderDetails
                onCancel={onCancel}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                customOrder={customOrder}
                onCompleteOrder={onCompleteOrder}
                closeModal={closeModal}
            />
            {isEditing && (<OrderPad />)}
        </div>
    );
}

export default OrderModal;