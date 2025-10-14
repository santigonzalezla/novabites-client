'use client';

import styles from './orderdetails.module.css';
import { AddItem, Card, Edit, Trash } from '@/app/components/svg';
import { CustomOrder } from '@/interfaces/interfaces';
import { useState } from 'react';
import { StatusOrder } from '@/interfaces/enums';

interface OrderDetailsProps {
    isEditing: boolean
    setIsEditing: (isEditing: boolean) => void
    customOrder: CustomOrder
    onCancel: (order: Partial<CustomOrder>) => void
    onCompleteOrder: (order: CustomOrder) => void;
    closeModal: () => void
}

const OrderDetails = ({ isEditing, setIsEditing, customOrder, onCancel, onCompleteOrder, closeModal }: OrderDetailsProps) =>
{
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const capitalizeFirstLetter = (str: string) =>
    {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handlePaymentMethodChange = (method: string) =>
    {
        setPaymentMethod(method);
    }

    return (
        <div className={styles.modalContent}>
            <div className={styles.orderDetails}>
                <div className={styles.headerleft}>
                    <div>
                        <h2>{customOrder.client?.name}</h2>
                        <p>
                            {capitalizeFirstLetter(new Date(customOrder.createdAt).toLocaleString('es-ES', { weekday: 'long' }))}, {' '}
                            {new Date(customOrder.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'})}
                        </p>
                    </div>
                    {customOrder.status === StatusOrder.PENDING && (
                        <div className={styles.headerright}>
                        <span title="Editar Orden">
                            <Edit
                                onClick={() => setIsEditing(!isEditing)}
                            />
                        </span>
                            <span title="Eliminar Orden">
                            <Trash
                                onClick={() => {
                                    onCancel({ id: customOrder.id, status: StatusOrder.CANCELED })
                                    closeModal();
                                }}
                            />
                        </span>
                        </div>
                    )}
                </div>
                <div className={styles.itemList}>
                    {customOrder.products?.map((product, index) => (
                        <div key={index} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.index}>{index + 1 < 10 ? `0${(index + 1)}` : (index + 1)}</span>
                                <span className={styles.itemName}>{product.product?.name}</span>
                            </div>
                            <div className={styles.itemcenter}>
                                <span className={styles.quantity}>
                                    <span className={`${isEditing ? styles.editable : ''}`}>×</span>
                                    <input
                                        type="number"
                                        className={`${styles.quantity} ${isEditing ? styles.editable : ''}`}
                                        value={product.quantity}
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                            // Handle price change logic here
                                        }}
                                    />
                                </span>
                            </div>
                            <span className={styles.itemPrice}>${product.unitPrice}</span>
                            {isEditing && <button className={styles.removeButton}><Trash /></button>}
                        </div>
                    ))}
                    {customOrder.details?.map((product, index) => (
                        <div key={index} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.index}>{(customOrder.products?.length ?? 0) + index + 1 < 10 ? `0${(customOrder.products?.length ?? 0) + (index + 1)}` : (customOrder.products?.length ?? 0) + (index + 1)}</span>
                                <span className={styles.itemName}>Torta Personalizada</span>
                            </div>
                            <div className={styles.itemcenter}>
                                <span className={styles.quantity}>{product.pounds} lbs - {product.tiers} Pisos</span>
                            </div>
                            <span className={styles.itemPrice}>${product.price}</span>
                            {isEditing && <button className={styles.removeButton}><Trash /></button>}
                        </div>
                    ))}
                    {isEditing && (
                        <div className={styles.addItem}>
                            <AddItem />
                            <span>Añadir Producto</span>
                        </div>
                    )}
                    {customOrder.products?.length === 0 && (
                        <div className={styles.noItems}>
                            <Card />
                            <p>No hay productos en esta orden</p>
                        </div>
                    )}
                </div>
                <div className={styles.orderSummary}>
                    <div className={styles.orderPaymentDetails}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${customOrder.totalPrice}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Avance</span>
                            <span>${customOrder.depositAmount}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>${Number(customOrder.totalPrice) - Number(customOrder.depositAmount)}</span>
                        </div>
                    </div>
                    <div className={styles.paymentMethods}>
                        {customOrder.status === StatusOrder.PENDING ? (
                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className={styles.completeOrderButton}
                                    onClick={() => {
                                        onCompleteOrder(customOrder)
                                        closeModal()
                                    }}
                                >
                                    Completar Orden
                                </button>
                            </div>
                        ) : (customOrder.status === StatusOrder.COMPLETED) ? (
                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={closeModal}
                                >
                                    ¡Orden Completada!
                                </button>
                            </div>
                        ) : (
                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.canceledButton}
                                    onClick={closeModal}
                                >
                                    ¡Orden Cancelada!
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;