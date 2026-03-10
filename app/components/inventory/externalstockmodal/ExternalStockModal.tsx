'use client';

import styles from './externalstockmodal.module.css';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import type { Product, Supplier } from '@/interfaces/interfaces';
import { X } from '@/app/components/svg';

interface ExternalStockItem {
    product: Product;
    quantity: number;
}

interface ExternalStockModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const ExternalStockModal = ({ onClose, onSuccess }: ExternalStockModalProps) => {
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [search, setSearch] = useState('');
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);

    const { data: suppliers } = useFetch<Supplier[]>('/api/supplier');
    const { data: products } = useFetch<Product[]>('/api/product');
    const { execute: executeAdd } = useFetch('/api/stock/external', {
        immediate: false,
        method: 'POST',
    });

    // Productos filtrados por proveedor y búsqueda
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products
            .filter(p => p.available !== false)
            .filter(p => !selectedSupplierId || p.supplierId === selectedSupplierId)
            .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, selectedSupplierId, search]);

    // Resetear cantidades al cambiar proveedor
    useEffect(() => {
        setQuantities({});
        setSearch('');
    }, [selectedSupplierId]);

    const handleQuantityChange = (productId: string, value: number) => {
        setQuantities(prev => ({ ...prev, [productId]: Math.max(0, value) }));
    };

    const selectedItems: ExternalStockItem[] = filteredProducts
        .filter(p => (quantities[p.id] || 0) > 0)
        .map(p => ({ product: p, quantity: quantities[p.id] }));

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            toast.error('Sin productos', {
                description: 'Ingresa al menos un producto con cantidad mayor a 0.',
                duration: 3000, richColors: true, position: 'top-right',
            });
            return;
        }

        setIsSaving(true);
        const result = await executeAdd({
            body: {
                items: selectedItems.map(i => ({
                    productId: i.product.id,
                    quantity: i.quantity,
                })),
            },
        });
        setIsSaving(false);

        if (result) {
            toast.success('Stock registrado', {
                description: `${selectedItems.length} producto(s) agregados al inventario.`,
                duration: 4000, richColors: true, position: 'top-right',
            });
            onSuccess?.();
            onClose();
        } else {
            toast.error('Error al registrar stock', {
                description: 'No se pudo actualizar el inventario. Intenta nuevamente.',
                duration: 3000, richColors: true, position: 'top-right',
            });
        }
    };

    const handleOverlayClick = () => onClose();
    const handleContentClick = (e: MouseEvent) => e.stopPropagation();

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} onClick={handleContentClick}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h2>Stock Externo</h2>
                        <p>Productos de proveedores externos — ingreso directo al inventario</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X /></button>
                </div>

                {/* Filtro por proveedor */}
                <div className={styles.supplierRow}>
                    <label className={styles.label}>Proveedor</label>
                    <select
                        className={styles.supplierSelect}
                        value={selectedSupplierId}
                        onChange={e => setSelectedSupplierId(e.target.value)}
                    >
                        <option value="">Todos los proveedores</option>
                        {(suppliers || []).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Buscador */}
                <div className={styles.searchRow}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Lista de productos */}
                <div className={styles.productList}>
                    {filteredProducts.length === 0 ? (
                        <p className={styles.empty}>
                            {selectedSupplierId
                                ? 'No hay productos para este proveedor'
                                : 'Selecciona un proveedor para ver sus productos'}
                        </p>
                    ) : (
                        filteredProducts.map(product => {
                            const qty = quantities[product.id] || 0;
                            const isSelected = qty > 0;
                            return (
                                <div key={product.id} className={`${styles.productRow} ${isSelected ? styles.productRowSelected : ''}`}>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        {product.category?.name && (
                                            <span className={styles.productCategory}>{product.category.name}</span>
                                        )}
                                    </div>
                                    <div className={styles.quantityControl}>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => handleQuantityChange(product.id, qty - 1)}
                                            disabled={qty === 0}
                                        >−</button>
                                        <input
                                            type="number"
                                            min={0}
                                            className={styles.qtyInput}
                                            value={qty}
                                            onChange={e => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                                        />
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => handleQuantityChange(product.id, qty + 1)}
                                        >+</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Resumen */}
                {selectedItems.length > 0 && (
                    <div className={styles.summary}>
                        <span>{selectedItems.length} producto(s) seleccionado(s)</span>
                        <span>{selectedItems.reduce((sum, i) => sum + i.quantity, 0)} unidades en total</span>
                    </div>
                )}

                {/* Acciones */}
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={isSaving || selectedItems.length === 0}
                    >
                        {isSaving ? 'Registrando...' : 'Registrar Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExternalStockModal;
