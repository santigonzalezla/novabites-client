import styles from './ordercard.module.css';
import { CustomOrder } from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import { Eye } from '@/app/components/svg';

interface OrderCardProps {
    index: number;
    customOrder: CustomOrder;
    setSelectedOrder: (order: CustomOrder) => void;
    onCompleteOrder: (order: CustomOrder) => void;
}

const OrderCard = ({ index, customOrder, setSelectedOrder, onCompleteOrder }: OrderCardProps) =>
{
    return (
        <div className={styles.orderdata}>
            <div className={styles.header}>
                <div className={styles.customerInfo}>
                    <div className={styles.orderNumberBox}>
                        {(index > 9) ? index + 1 : `0${index + 1}`}
                    </div>
                    <div className={styles.customerDetails}>
                        <h3 className={styles.customerName}>{customOrder.client?.name}</h3>
                        <p className={styles.orderNumber}>Order # {customOrder.numId}</p>
                    </div>
                </div>
                <div className={styles.headerright}>
                    {customOrder.status !== StatusOrder.PENDING && <Eye onClick={() => setSelectedOrder(customOrder)}/>}
                    <div
                        className={customOrder.status === StatusOrder.COMPLETED
                            ? styles.statusCompleted
                            : (customOrder.status === StatusOrder.PENDING ? styles.statusPending : styles.statusCancelled)
                        }>
                        {customOrder.status === StatusOrder.COMPLETED ? 'Completado' :
                            (customOrder.status === StatusOrder.PENDING ? 'Pendiente' : 'Cancelado')}
                    </div>
                </div>
            </div>

            <div className={styles.deliverySection}>
                <div className={styles.deliveryInfo}>
                    <span className={styles.label}>Fecha de Entrega:</span>
                    <span>{new Date(customOrder.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                </div>
                <div className={styles.deliveryInfo}>
                    <span className={styles.label}>Items:</span>
                    <span>{customOrder.products?.length}</span>
                </div>
                <div className={styles.deliveryInfo}>
                    <span className={styles.label}>Total:</span>
                    <span>${customOrder.totalPrice}</span>
                </div>
            </div>

            {customOrder.status === StatusOrder.PENDING ? (
                <div className={styles.buttonsContainer}>
                    <button className={styles.detailsButton} onClick={() => setSelectedOrder(customOrder)}>Detalles</button>
                    <button className={styles.completeButton} onClick={() => onCompleteOrder(customOrder)}>Completar Pedido</button>
                </div>
            ) : (customOrder.status === StatusOrder.COMPLETED) ? (
                <div className={styles.buttonsContainer}>
                    <button className={styles.completedButton}>Pedido Completado</button>
                </div>
            ) : (
                <div className={styles.buttonsContainer}>
                    <button className={styles.cancelledButton}>Pedido Cancelado</button>
                </div>
            )}
        </div>
    );
}

export default OrderCard;