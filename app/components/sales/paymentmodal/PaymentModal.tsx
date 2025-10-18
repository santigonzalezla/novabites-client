import styles from './paymentmodal.module.css';
import React, { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Card, Cash, Plus, Transfer } from '@/app/components/svg';
import { Product } from '@/interfaces/interfaces';
import { toast } from 'sonner';
import OrdersDetailsModal from '@/app/components/orderslist/ordersdetailsmodal/OrdersDetailsModal';

interface PaymentModalProps {
    handleCreateOrder: (order: any) => any;
    orderData: any;
    setOrderData: (data: any) => void;
    quantities: { [productId: string]: number };
    onClose: () => void;
    cartItems: Partial<Product>[];
}

const PaymentModal = ({ handleCreateOrder, orderData, setOrderData, quantities, onClose, cartItems }: PaymentModalProps) =>
{
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [transferOption, setTransferOption] = useState('nequi');
    const [amountReceived, setAmountReceived] = useState('');
    const [change, setChange] = useState('0');
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);


    useEffect(() =>
    {
        if (paymentMethod === 'Cash' && amountReceived)
        {
            const received = parseFloat(amountReceived);
            const total = parseFloat(orderData.total);

            (received >= total) ? setChange(String(received - total)) : setChange('0');
        }
    }, [amountReceived, paymentMethod]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    {
        const { name, value } = e.target;
        setOrderData({
            ...orderData,
            [name]: value
        });
    };

    const handlePaymentMethodChange = (method: string) =>
    {
        setPaymentMethod(method);
        setOrderData({
            ...orderData,
            paymentMethod: method
        });
    };

    const validatePaymentForm = (): boolean =>
    {
        if (!paymentMethod)
        {
            toast.error("Método de pago requerido", {
                description: "Debes seleccionar un método de pago.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return false;
        }

        if (paymentMethod === 'Cash')
        {
            if (!amountReceived || amountReceived.trim() === '')
            {
                toast.error("Monto recibido requerido", {
                    description: "Debes ingresar el monto recibido en efectivo.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return false;
            }

            const received = parseFloat(amountReceived);
            const total = parseFloat(orderData.total);

            if (received < total)
            {
                toast.error("Monto insuficiente", {
                    description: "El monto recibido debe ser mayor o igual al total.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return false;
            }
        }

        if (paymentMethod === 'Transfer' && !transferOption)
        {
            toast.error("Opción de transferencia requerida", {
                description: "Debes seleccionar una opción de transferencia.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return false;
        }

        return true;
    };

    const handleCashInputChange = (digit: string) =>
    {
        if (digit === 'clear')
        {
            setAmountReceived('');
            setChange('0');
        }
        else if (digit === 'backspace')
        {
            setAmountReceived((prev) => prev.slice(0, -1));
        }
        else
        {
            setAmountReceived(prev =>
            {
                if (prev === '' && digit ==='-') return '0';
                if (digit === '.' && prev.includes('.')) return prev;
                if (prev.includes('.') && prev.split('.')[1].length >= 2 && digit !== 'backspace') return prev;

                return prev + digit;
            });
        }
    }

    const formatCurrency = (value: string) =>
    {
        let cleanValue = value.replace(/\./g, '');
        let [integerPart, decimalPart] = cleanValue.split('.');
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        decimalPart = decimalPart ? decimalPart.padEnd(2, '0').substring(0, 2) : '00';

        return `${integerPart}.${decimalPart}`;
    };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        if (!validatePaymentForm()) return;

        let orderToCreate: any = {
            quantities,
            cartItems,
            total: orderData.total
        };

        if (paymentMethod === 'Transfer')
        {
            orderToCreate.paymentMethod = `Transferencia/${transferOption.charAt(0).toUpperCase() + transferOption.slice(1)}`;
        }
        else if (paymentMethod === 'Cash')
        {
            orderToCreate.paymentMethod = 'Efectivo';
            orderToCreate.amountReceived = amountReceived;
            orderToCreate.change = change;
        }
        else if (paymentMethod === 'Card')
        {
            orderToCreate.paymentMethod = 'Debito/Crédito';
        }

        const createdOrder = await handleCreateOrder(orderToCreate);

        if (createdOrder)
        {
            setCreatedOrderId(createdOrder.id);
            setShowOrderDetails(true);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) onClose();
    };

    const handleCloseOrderDetails = () =>
    {
        setShowOrderDetails(false);
        setCreatedOrderId(null);
        onClose();
    };

    if (showOrderDetails && createdOrderId)
    {
        return (
            <OrdersDetailsModal
                orderId={createdOrderId}
                type="order"
                onClose={handleCloseOrderDetails}
            />
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalContainer}>
                    {/* Left side - Order details */}
                    <div className={styles.orderDetails}>
                        <div className={styles.orderDetailsTop}>
                            <div className={styles.orderTop}>
                                <button className={styles.backButton} onClick={onClose}>
                                    <ArrowLeft />
                                </button>
                            </div>

                            <div className={styles.orderHeader}>
                                <div className={styles.headerInfo}>
                                    <h2>Confirmación</h2>
                                    <p>Orden #{orderData.orderId}</p>
                                </div>

                                <div className={styles.addButton}>
                                    <Plus />
                                </div>
                            </div>
                        </div>

                        <div className={styles.cartItems}>
                            {cartItems.map((item, index) => (
                                <div key={index} className={styles.cartItem}>
                                    <div className={styles.itemImage}>
                                        <Image
                                            src={item.imageUrl || '/placeholder.jpg'}
                                            alt={item.name || ''}
                                            width={40}
                                            height={40}
                                            style={{objectFit: 'cover'}}
                                        />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemTitle}>{item.name}</p>
                                        <p className={styles.itemPrice}>${item.basePrice}</p>
                                    </div>
                                    <div className={styles.itemQuantity}>
                                        <span>{quantities[item.id!] || 0}</span>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        ${(Number(item.basePrice) * (quantities[item.id!] || 0))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.orderSummary}>
                            <div className={styles.subtotalRow}>
                                <p>Total</p>
                                <span>${orderData.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Payment form */}
                    <div className={styles.paymentForm}>
                        <h2 className={styles.paymentTitle}>Pago</h2>
                        <p className={styles.paymentSubtitle}>3 métodos de pago disponibles.</p>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <div className={styles.paymentMethodSection}>
                                    <h3>Método de Pago</h3>
                                    <div className={styles.paymentMethods}>
                                        <div
                                            className={`${styles.paymentMethod} ${paymentMethod === 'Cash' ? styles.selected : ''}`}
                                            onClick={() => handlePaymentMethodChange('Cash')}
                                        >
                                            <Cash />
                                            <span>Efectivo</span>
                                        </div>
                                        <div
                                            className={`${styles.paymentMethod} ${paymentMethod === 'Transfer' ? styles.selected : ''}`}
                                            onClick={() => handlePaymentMethodChange('Transfer')}
                                        >
                                            <Transfer />
                                            <span>Transferencia</span>
                                        </div>
                                        <div
                                            className={`${styles.paymentMethod} ${paymentMethod === 'Card' ? styles.selected : ''}`}
                                            onClick={() => handlePaymentMethodChange('Card')}
                                        >
                                            <Card />
                                            <span>Débito / Crédito</span>
                                        </div>
                                    </div>
                                </div>

                                {paymentMethod === 'Transfer' && (
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="orderType">Opción de Pago</label>
                                            <select
                                                id="orderType"
                                                name="orderType"
                                                value={transferOption}
                                                onChange={(e) => {
                                                    setTransferOption(e.target.value);
                                                    setOrderData({
                                                        ...orderData,
                                                        transferOption: e.target.value
                                                    });
                                                }}
                                            >
                                                <option value="nequi">Nequi</option>
                                                <option value="daviplata">Daviplata</option>
                                                <option value="bancolombia">Bancolombia</option>
                                                <option value="otros">Otros Bancos</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'Cash' && (
                                    <div className={styles.cashSection}>
                                        <div className={styles.cashSectionTop}>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label htmlFor="amountReceived">Monto Recibido</label>
                                                    <input
                                                        type="text"
                                                        id="amountReceived"
                                                        name="amountReceived"
                                                        value={`$ ${amountReceived}`}
                                                        onChange={handleInputChange}
                                                        placeholder="$ 0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.numpad}>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('1')}>1</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('2')}>2</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('3')}>3</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('4')}>4</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('5')}>5</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('6')}>6</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('7')}>7</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('8')}>8</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('9')}>9</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('clear')}>C</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('0')}>0</button>
                                            <button type="button" className={styles.numpadButton} onClick={() => handleCashInputChange('backspace')}>x</button>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor={'cashDeliver'}>Entregar al Cliente</label>
                                            <input
                                                name={'cashDeliver'}
                                                type="text"
                                                value={`$ ${change}`}
                                                readOnly
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelButton} onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.confirmButton}>
                                    Confirmar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
