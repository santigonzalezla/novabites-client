"use client"

import { useState } from 'react'
import styles from './addordermodal.module.css';
import type { Client, CustomOrder, CustomOrderProduct, DetailCustomOrder, Product } from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import { useFetch } from '@/hooks/useFetch';
import { AddItem, Check, Plus } from '@/app/components/svg';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Partial<CustomOrder>) => void;
}

const AddOrderModal = ({ isOpen, onClose, onSave }: AddOrderModalProps) =>
{
    const { user } = useAuth();
    const { data, isLoading, error } = useFetch<Product[]>('/api/product');
    const [clientData, setClientData] = useState<Partial<Client>>({name: '', phone: '', email: ''});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [unitPrice, setUnitPrice] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [depositAmount, setDepositAmount] = useState<string>('');
    const [detailOrders, setDetailOrders] = useState<Partial<DetailCustomOrder>[]>([
        { imageUrl: '', pounds: 0, tiers: 0 }
    ]);
    const [productList, setProductList] = useState<{product: Product, quantity: number}[]>([]);

    const handleAddProduct = (productItem: {product: Product, quantity: number}) =>
    {
        setProductList([...productList, productItem]);
    }

    const calculateTotal = () =>
    {
        const detailTotal = detailOrders.reduce((total, detail) => total + (detail.price ? Number(detail.price) : 0), 0);
        const productTotal = productList.reduce((total, item) => total + (Number(item.product.basePrice) * item.quantity), 0);
        return detailTotal + productTotal;
    }

    const validateOrderForm = (): boolean =>
    {
        if (!clientData.name || clientData.name.trim() === '')
        {
            toast.error("Nombre del cliente requerido", {
                description: "El nombre del cliente es obligatorio.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return false;
        }

        if (!clientData.phone || clientData.phone.trim() === '')
        {
            toast.error("Teléfono del cliente requerido", {
                description: "El teléfono del cliente es obligatorio.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return false;
        }

        const hasProducts = productList.length > 0;
        const hasValidCakes = detailOrders.some(detail =>
            detail.pounds && detail.pounds > 0 &&
            detail.tiers && detail.tiers > 0 &&
            detail.price && Number(detail.price) > 0
        );

        if (!hasProducts && !hasValidCakes)
        {
            toast.error("Pedido vacío", {
                description: "Debe agregar al menos un producto o una torta personalizada al pedido.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return false;
        }

        for (let i = 0; i < detailOrders.length; i++)
        {
            const detail = detailOrders[i];
            const hasPounds = detail.pounds && detail.pounds > 0;
            const hasTiers = detail.tiers && detail.tiers > 0;
            const hasPrice = detail.price && Number(detail.price) > 0;

            if (hasPounds || hasTiers || hasPrice)
            {
                if (!hasPounds)
                {
                    toast.error("Torta incompleta", {
                        description: `La torta ${i + 1} debe tener libras especificadas.`,
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    return false;
                }
                if (!hasTiers)
                {
                    toast.error("Torta incompleta", {
                        description: `La torta ${i + 1} debe tener niveles especificados.`,
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    return false;
                }
                if (!hasPrice)
                {
                    toast.error("Torta incompleta", {
                        description: `La torta ${i + 1} debe tener precio especificado.`,
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    return false;
                }
            }
        }

        return true;
    };

    const handleSaveOrder = () =>
    {
        if (!validateOrderForm()) return;

        const products = productList.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.basePrice
        }));

        const newOrder: Partial<CustomOrder> = {
            storeId: user?.storeId,
            userId: user?.userId,
            depositAmount: String(depositAmount ? parseFloat(depositAmount) : 0),
            remainingAmount: String(calculateTotal() - (depositAmount ? parseFloat(depositAmount) : 0)),
            totalPrice: String(calculateTotal()),
            status: StatusOrder.PENDING,
            available: true,
        };

        const hasClientData = clientData.name?.trim() || clientData.phone?.trim() || clientData.email?.trim();

        if (hasClientData) newOrder.client = { name: clientData.name, phone: clientData.phone, email: clientData.email };

        if (productList.length > 0) newOrder.products = products as CustomOrderProduct[];

        const validDetails = detailOrders.filter(detail =>
            detail.pounds && detail.pounds > 0 ||
            detail.tiers && detail.tiers > 0 ||
            detail.price && Number(detail.price) > 0
        );

        if (validDetails.length > 0) newOrder.details = validDetails as DetailCustomOrder[];

        onSave(newOrder);
    }
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Agregar Nuevo Pedido</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    {/* Client Information */}
                    <div className={styles.section}>
                        <h3>Información del Cliente</h3>
                        <p>Ingrese los datos del cliente para el nuevo pedido:</p>
                        <div className={styles.inputGroupName}>
                            <input
                                type="text"
                                placeholder="Nombre del cliente"
                                value={clientData.name}
                                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                                className={styles.input}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={clientData.phone}
                                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                                className={styles.input}
                            />
                            <input
                                type="email"
                                placeholder="Email (opcional)"
                                value={clientData.email}
                                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectiontop}>
                            <h3>Pedido Personalizado</h3>
                            <button
                                className={styles.addDetailButton}
                                onClick={() => setDetailOrders([...detailOrders, { imageUrl: '', pounds: 0, tiers: 0 }])}
                            >
                                + Agregar Torta
                            </button>
                        </div>
                        <p>Ingrese las especificaciones del pedido personalizado:</p>
                        <div className={styles.detailList}>
                            {detailOrders.map((detail, index) => (
                                <div className={styles.inputDetailGroup} key={index}>
                                    <div className={styles.fileInput}>
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) =>
                                            {
                                                const file = e.target.files?.[0];
                                                if (file) setSelectedImage(file);
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.customFileButton}
                                            onClick={() => document.getElementById('image')?.click()}
                                        >
                                            <AddItem />
                                            {selectedImage ? <Check /> : ''}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        id="pounds"
                                        placeholder="Libras"
                                        value={detail.pounds || ''}
                                        onChange={(e) =>{
                                            const newDetailOrders = [...detailOrders];
                                            newDetailOrders[index].pounds = parseInt(e.target.value);
                                            setDetailOrders(newDetailOrders);
                                        }}
                                        className={styles.input}
                                        required
                                    />
                                    <input
                                        type="number"
                                        id="tiers"
                                        placeholder="Niveles"
                                        value={detail.tiers || ''}
                                        onChange={(e) => {
                                            const newDetailOrders = [...detailOrders];
                                            newDetailOrders[index].tiers = parseInt(e.target.value);
                                            setDetailOrders(newDetailOrders);
                                        }}
                                        className={styles.input}
                                        required
                                    />
                                    <input
                                        type="number"
                                        id="price"
                                        placeholder="Precio"
                                        value={detail.price || ''}
                                        onChange={(e) => {
                                            const newDetailOrders = [...detailOrders];
                                            newDetailOrders[index].price = parseFloat(e.target.value);
                                            setDetailOrders(newDetailOrders);
                                        }}
                                        className={styles.input}
                                        required
                                    />
                                    {detailOrders.length > 1 && (
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => {
                                                const newDetailOrders = detailOrders.filter((_, i) => i !== index);
                                                setDetailOrders(newDetailOrders);
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className={styles.section}>
                        <h3>Productos</h3>
                        <p>Seleccione los productos que desea agregar al pedido:</p>
                        {/* Add Product Form */}
                        <div className={styles.addProductForm}>
                            <div className={styles.addInputGroup}>
                                <select
                                    className={styles.input}
                                    value={selectedProduct ? selectedProduct.id : ''}
                                    onChange={(e) => {
                                        const productId = e.target.value;
                                        const product = data?.find(p => p.id === productId) || null;
                                        setSelectedProduct(product);
                                        setUnitPrice(product ? product.basePrice.toString() : '');
                                    }}
                                >
                                    <option value="">Seleccione un producto</option>
                                    {data?.map((product: Product, index: number) => (
                                        <option key={index} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    placeholder="Precio unitario"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value)}
                                    step="0.01"
                                    className={styles.input}
                                />
                            </div>
                            <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => {
                                    if (selectedProduct && unitPrice)
                                    {
                                        if (quantity && Number(quantity) > 0)
                                        {
                                            handleAddProduct({ product: selectedProduct, quantity: Number(quantity) });
                                            // Reset fields
                                            setSelectedProduct(null);
                                            setUnitPrice('');
                                            setQuantity('');
                                        }
                                    }
                                }}
                            >
                                <Plus />
                            </button>
                        </div>

                        {/* Products List */}
                        {productList.length > 0 && (
                            <div className={styles.productsList}>
                                {productList.map((productListItem: any, index: number) => (
                                    <div key={index} className={styles.productItem}>
                                        <div className={styles.productInfo}><span className={styles.productName}>{productListItem?.product.name}</span>
                                            <span className={styles.productDetails}>{productListItem.quantity} × ${productListItem?.product.basePrice} ----- ${productListItem?.product.basePrice*productListItem.quantity}</span>
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => setProductList(productList.filter((_, i) => i !== index))}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Information */}
                    <div className={styles.section}>
                        <h3>Información de Pago</h3>
                        <div className={styles.paymentInfo}>
                            <div className={styles.paymentRow}>
                                <span>Subtotal:</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    placeholder="Monto de avance"
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.paymentRow}>
                                <span>Restante:</span>
                                <span>${calculateTotal() - Number(depositAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    <button className={styles.saveButton} onClick={handleSaveOrder}>
                        Guardar Pedido
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddOrderModal
