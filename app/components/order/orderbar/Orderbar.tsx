'use client';

import styles from './orderbar.module.css';
import { StatusOrder } from '@/interfaces/enums';

const orderStates = [
    { key: 'all', name: 'Todos'},
    { key: StatusOrder.PENDING, name: 'En Progreso'},
    { key: StatusOrder.COMPLETED, name: 'Completados'},
    { key: StatusOrder.CANCELED, name: 'Cancelados'},
];

interface OrderbarProps {
    setStatusOrder?: (status: StatusOrder | string) => void;
    statusOrder?: StatusOrder | 'all';
}

const Orderbar = ({ setStatusOrder, statusOrder }: OrderbarProps) =>
{
    const handleSetSelected = (name: string) =>
    {
        if (setStatusOrder)
        {
            const orderState = orderStates.find(state => state.name === name);

            if (orderState)
            {
                setStatusOrder(orderState.key as StatusOrder | string);
            }
        }
    };

    return (
        <div className={styles.orderbar}>
            {orderStates.map((orderState) => (
                <div
                    key={orderState.key}
                    className={`${styles.orderbaroption} ${statusOrder === orderState.key ? styles.active : ''}`}
                    onClick={() => handleSetSelected(orderState.name)}
                >
                    {orderState.name}
                </div>
            ))}
        </div>
    );
}

export default Orderbar;