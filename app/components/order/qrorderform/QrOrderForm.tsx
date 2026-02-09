"use client"

import { useEffect, useRef, useState } from 'react'
import styles from './qrorderform.module.css';
import type { Client, CustomOrder, CustomOrderProduct, DetailCustomOrder, Product } from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import { AddItem, Check, Plus } from '@/app/components/svg';
import { toast } from 'sonner';
import { SERVER_URL } from '@/lib/constants';

interface QrOrderFormProps {
    token: string;
    userId: string;
    storeId: string;
    onSuccess?: () => void;
}

const QrOrderForm = ({ token, userId, storeId, onSuccess }: QrOrderFormProps) =>
{
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientData, setClientData] = useState<Partial<Client>>({ name: '', phone: '', email: '' });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [unitPrice, setUnitPrice] = useState<string>('');
    const [depositAmount, setDepositAmount] = useState<string>('');
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [detailOrders, setDetailOrders] = useState<Partial<DetailCustomOrder>[]>([
        { imageUrl: '', pounds: 0, tiers: 0 }
    ]);
    const [productList, setProductList] = useState<{ product: Product, quantity: number }[]>([]);
    const [imageFiles, setImageFiles] = useState<Map<number, File>>(new Map());
    const [imagePreviews, setImagePreviews] = useState<Map<number, string>>(new Map());
    const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

    useEffect(() =>
    {
        const fetchProducts = async () =>
        {
            try
            {
                const response = await fetch(`${SERVER_URL}/api/product`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok)
                {
                    const data = await response.json();
                    setProducts(data);
                }
            }
            catch (e)
            {
                console.error('Error fetching products:', e);
            }
            finally
            {
                setIsLoadingProducts(false);
            }
        }

        fetchProducts();
    }, [token]);

    const handleImageChange = (index: number, file: File) =>
    {
        if (!file.type.startsWith('image/'))
        {
            toast.error("Archivo no válido", {
                description: "Solo se permiten archivos de imagen.",
                duration: 3000, richColors: true, position: 'top-right'
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024)
        {
            toast.error("Archivo muy grande", {
                description: "El archivo no debe superar los 5MB.",
                duration: 3000, richColors: true, position: 'top-right'
            });
            return;
        }

        const newFiles = new Map(imageFiles);
        newFiles.set(index, file);
        setImageFiles(newFiles);

        const reader = new FileReader();
        reader.onloadend = () =>
        {
            const newPreviews = new Map(imagePreviews);
            newPreviews.set(index, reader.result as string);
            setImagePreviews(newPreviews);
        };
        reader.readAsDataURL(file);
    }

    const handleAddProduct = (productItem: { product: Product, quantity: number }) =>
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
                duration: 3000, richColors: true, position: 'top-right'
            });
            return false;
        }

        if (!clientData.phone || clientData.phone.trim() === '')
        {
            toast.error("Teléfono del cliente requerido", {
                description: "El teléfono del cliente es obligatorio.",
                duration: 3000, richColors: true, position: 'top-right'
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
                duration: 3000, richColors: true, position: 'top-right'
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
                        duration: 3000, richColors: true, position: 'top-right'
                    });
                    return false;
                }
                if (!hasTiers)
                {
                    toast.error("Torta incompleta", {
                        description: `La torta ${i + 1} debe tener niveles especificados.`,
                        duration: 3000, richColors: true, position: 'top-right'
                    });
                    return false;
                }
                if (!hasPrice)
                {
                    toast.error("Torta incompleta", {
                        description: `La torta ${i + 1} debe tener precio especificado.`,
                        duration: 3000, richColors: true, position: 'top-right'
                    });
                    return false;
                }
            }
        }

        return true;
    };

    const handleSaveOrder = async () =>
    {
        if (!validateOrderForm()) return;

        setIsSubmitting(true);

        try
        {
            const orderProducts = productList.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.product.basePrice
            }));

            const validDetails = detailOrders.filter(detail =>
                detail.pounds && detail.pounds > 0 ||
                detail.tiers && detail.tiers > 0 ||
                detail.price && Number(detail.price) > 0
            );

            // Reorder details: those with images first, then those without
            const detailsWithImageIndex: { detail: Partial<DetailCustomOrder>, originalIndex: number }[] = [];
            const detailsWithoutImage: Partial<DetailCustomOrder>[] = [];

            validDetails.forEach((detail, idx) =>
            {
                const originalIndex = detailOrders.indexOf(detail);
                if (imageFiles.has(originalIndex))
                {
                    detailsWithImageIndex.push({ detail, originalIndex });
                }
                else
                {
                    detailsWithoutImage.push(detail);
                }
            });

            const orderedDetails = [
                ...detailsWithImageIndex.map(d => d.detail),
                ...detailsWithoutImage
            ];

            const orderedFiles = detailsWithImageIndex.map(d => imageFiles.get(d.originalIndex)!);

            const total = calculateTotal();
            const deposit = depositAmount ? parseFloat(depositAmount) : 0;

            const newOrder: Partial<CustomOrder> = {
                storeId: storeId,
                userId: userId,
                depositAmount: String(deposit),
                remainingAmount: String(total - deposit),
                totalPrice: String(total),
                deliveryDate: new Date(deliveryDate).toISOString().split('T')[0],
                status: StatusOrder.PENDING,
                available: true,
            };

            const hasClientData = clientData.name?.trim() || clientData.phone?.trim() || clientData.email?.trim();
            if (hasClientData) newOrder.client = { name: clientData.name, phone: clientData.phone, email: clientData.email };
            if (productList.length > 0) newOrder.products = orderProducts as CustomOrderProduct[];
            if (orderedDetails.length > 0) newOrder.details = orderedDetails as DetailCustomOrder[];

            let response: Response;

            if (orderedFiles.length > 0)
            {
                const formData = new FormData();
                formData.append('storeId', newOrder.storeId || '');
                formData.append('userId', newOrder.userId || '');
                formData.append('depositAmount', String(newOrder.depositAmount));
                formData.append('remainingAmount', String(newOrder.remainingAmount));
                formData.append('totalPrice', String(newOrder.totalPrice));
                formData.append('deliveryDate', newOrder.deliveryDate as string);
                formData.append('status', newOrder.status || StatusOrder.PENDING);
                formData.append('available', 'true');

                if (newOrder.client) formData.append('client', JSON.stringify(newOrder.client));
                if (newOrder.details) formData.append('details', JSON.stringify(newOrder.details));
                if (newOrder.products) formData.append('products', JSON.stringify(newOrder.products));

                orderedFiles.forEach(file => formData.append('images', file));

                response = await fetch(`${SERVER_URL}/api/custom-order`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
            }
            else
            {
                response = await fetch(`${SERVER_URL}/api/custom-order`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newOrder),
                });
            }

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear el pedido');
            }

            toast.success("Pedido creado exitosamente", {
                description: "Tu pedido personalizado ha sido registrado.",
                duration: 5000, richColors: true, position: 'top-right'
            });

            onSuccess?.();
        }
        catch (e)
        {
            console.error('Error creating order:', e);
            toast.error("Error al crear el pedido", {
                description: e instanceof Error ? e.message : "Ha ocurrido un error inesperado.",
                duration: 3000, richColors: true, position: 'top-right'
            });
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    const handleRemoveDetail = (index: number) =>
    {
        const newDetails = detailOrders.filter((_, i) => i !== index);
        setDetailOrders(newDetails);

        const newFiles = new Map(imageFiles);
        const newPreviews = new Map(imagePreviews);
        newFiles.delete(index);
        newPreviews.delete(index);

        // Reindex maps
        const reindexedFiles = new Map<number, File>();
        const reindexedPreviews = new Map<number, string>();
        let newIdx = 0;
        for (let i = 0; i < detailOrders.length; i++)
        {
            if (i === index) continue;
            if (newFiles.has(i)) reindexedFiles.set(newIdx, newFiles.get(i)!);
            if (newPreviews.has(i)) reindexedPreviews.set(newIdx, newPreviews.get(i)!);
            newIdx++;
        }

        setImageFiles(reindexedFiles);
        setImagePreviews(reindexedPreviews);
    }

    return (
        <div className={styles.container}>
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
                    />
                    <input
                        type="tel"
                        placeholder="Teléfono"
                        value={clientData.phone}
                        onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={clientData.email}
                        onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    />
                </div>
            </div>

            {/* Cake Details */}
            <div className={styles.section}>
                <div className={styles.sectiontop}>
                    <h3>Pedido Personalizado</h3>
                    <button
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
                                    id={`qr-image-${index}`}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={(el) => { if (el) fileInputRefs.current.set(index, el); }}
                                    onChange={(e) =>
                                    {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageChange(index, file);
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.customFileButton}
                                    onClick={() => fileInputRefs.current.get(index)?.click()}
                                >
                                    {imagePreviews.has(index) ? (
                                        <img src={imagePreviews.get(index)} alt="Preview" className={styles.imagePreview} />
                                    ) : (
                                        <AddItem />
                                    )}
                                    {imageFiles.has(index) ? <Check /> : ''}
                                </button>
                            </div>
                            <input
                                type="number"
                                placeholder="Libras"
                                value={detail.pounds || ''}
                                onChange={(e) => {
                                    const newDetailOrders = [...detailOrders];
                                    newDetailOrders[index].pounds = parseInt(e.target.value);
                                    setDetailOrders(newDetailOrders);
                                }}
                            />
                            <input
                                type="number"
                                placeholder="Niveles"
                                value={detail.tiers || ''}
                                onChange={(e) => {
                                    const newDetailOrders = [...detailOrders];
                                    newDetailOrders[index].tiers = parseInt(e.target.value);
                                    setDetailOrders(newDetailOrders);
                                }}
                            />
                            <input
                                type="number"
                                placeholder="Precio"
                                value={detail.price || ''}
                                onChange={(e) => {
                                    const newDetailOrders = [...detailOrders];
                                    newDetailOrders[index].price = parseFloat(e.target.value);
                                    setDetailOrders(newDetailOrders);
                                }}
                            />
                            {detailOrders.length > 1 && (
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveDetail(index)}
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
                <div className={styles.addProductForm}>
                    <div className={styles.addInputGroup}>
                        <select
                            value={selectedProduct ? selectedProduct.id : ''}
                            onChange={(e) => {
                                const productId = e.target.value;
                                const product = products?.find(p => p.id === productId) || null;
                                setSelectedProduct(product);
                                setUnitPrice(product ? product.basePrice.toString() : '');
                            }}
                        >
                            <option value="">Seleccione un producto</option>
                            {products?.map((product: Product, index: number) => (
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
                        />
                        <input
                            type="number"
                            placeholder="Precio unitario"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            step="0.01"
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

                {productList.length > 0 && (
                    <div className={styles.productsList}>
                        {productList.map((productListItem: any, index: number) => (
                            <div key={index} className={styles.productItem}>
                                <div className={styles.productInfo}>
                                    <span className={styles.productName}>{productListItem?.product.name}</span>
                                    <span className={styles.productDetails}>
                                        {productListItem.quantity} × ${productListItem?.product.basePrice} ----- ${productListItem?.product.basePrice * productListItem.quantity}
                                    </span>
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

            {/* Delivery Date */}
            <div className={styles.section}>
                <h3>Fecha de Entrega:</h3>
                <div className={styles.paymentInfo}>
                    <div className={styles.inputGroup}>
                        <input
                            type="date"
                            placeholder="Fecha de Entrega"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                    </div>
                </div>
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
                        />
                    </div>
                    <div className={styles.paymentRow}>
                        <span>Restante:</span>
                        <span>${calculateTotal() - Number(depositAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button
                    className={styles.saveButton}
                    onClick={handleSaveOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                </button>
            </div>
        </div>
    )
}

export default QrOrderForm
