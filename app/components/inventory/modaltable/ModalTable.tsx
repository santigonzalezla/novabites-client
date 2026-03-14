'use client';

import styles from './modaltable.module.css';
import { AddItem, Trash } from '@/app/components/svg';
import { ReactNode, useState } from 'react';
import { CategoryProduct, Product } from '@/interfaces/interfaces';
import { ReturnReason } from '@/interfaces/enums';

const returnReasonLabels: Record<ReturnReason, string> = {
    [ReturnReason.DAMAGED]: 'Dañado',
    [ReturnReason.EXPIRED]: 'Vencido',
    [ReturnReason.INCORRECT]: 'Incorrecto',
    [ReturnReason.EXCESS_STOCK]: 'Exceso de stock',
    [ReturnReason.OTHER]: 'Otro'
};

export type StoreRequestItem = {
    product: Partial<Product>;
    requestStock?: number;
    returnReason?: ReturnReason;
    categoryId?: string;
}

export type Column = {
    key: string;
    header: string;
    renderType?: 'date' | 'decimal';
    render?: (value: any, row: any) => ReactNode;
    width?: string;
}

export type TableConfig = {
    columns: Column[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

type ModalTableProps = {
    data: any[];
    products: Product[] | null;
    categories?: CategoryProduct[] | null;
    config: TableConfig;
    onDataChange?: (data: StoreRequestItem[]) => void;
}

const ModalTable = ({ data, products, categories, config, onDataChange }: ModalTableProps) =>
{
    const [currentPage, setCurrentPage] = useState(1);
    const [tableData, setTableData] = useState<StoreRequestItem[]>(data || []);

    // Panel de productos (fuera de la tabla)
    const [pickerRowIndex, setPickerRowIndex] = useState<number | null>(null);
    const [pickerCategoryId, setPickerCategoryId] = useState('');
    const [pickerSearch, setPickerSearch] = useState('');

    const itemsPerPage = config.itemsPerPage || 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = tableData.length > 0 ? Math.ceil(tableData.length / itemsPerPage) : 1;

    const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ── Al seleccionar categoría en una fila ──────────────────────────────────

    const handleCategoryChange = (rowIndex: number, categoryId: string) =>
    {
        const updatedData = [...tableData];
        updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            categoryId,
            product: { id: '', name: '', centralStock: 0, minStock: 0 },
        };
        setTableData(updatedData);
        onDataChange?.(updatedData);

        if (categoryId) {
            setPickerRowIndex(rowIndex);
            setPickerCategoryId(categoryId);
            setPickerSearch('');
        } else {
            setPickerRowIndex(null);
            setPickerCategoryId('');
        }
    };

    // ── Al seleccionar producto en el panel ───────────────────────────────────

    const handleProductSelect = (product: Product) =>
    {
        if (pickerRowIndex === null) return;

        const updatedData = [...tableData];
        updatedData[pickerRowIndex] = {
            ...updatedData[pickerRowIndex],
            product,
            categoryId: pickerCategoryId || updatedData[pickerRowIndex].categoryId || product.categoryId || '',
        };
        setTableData(updatedData);
        onDataChange?.(updatedData);
        setPickerRowIndex(null);
        setPickerSearch('');
    };

    // ── Handlers de fila ──────────────────────────────────────────────────────

    const addNewRow = () =>
    {
        const newItem: StoreRequestItem = {
            product: { id: '', name: '', centralStock: 0, minStock: 0 },
            requestStock: 1,
            categoryId: '',
        };
        const updatedData = [...tableData, newItem];
        setTableData(updatedData);
        onDataChange?.(updatedData);
    };

    const updateRequestStock = (index: number, value: number) =>
    {
        const updatedData = [...tableData];
        updatedData[index] = { ...updatedData[index], requestStock: value };
        setTableData(updatedData);
        onDataChange?.(updatedData);
    };

    const updateReturnReason = (index: number, value: ReturnReason) =>
    {
        const updatedData = [...tableData];
        updatedData[index] = { ...updatedData[index], returnReason: value };
        setTableData(updatedData);
        onDataChange?.(updatedData);
    };

    const removeRow = (index: number) =>
    {
        if (pickerRowIndex === index) { setPickerRowIndex(null); setPickerCategoryId(''); }
        const updatedData = tableData.filter((_, i) => i !== index);
        setTableData(updatedData);
        onDataChange?.(updatedData);
    };

    // ── Render de celdas ──────────────────────────────────────────────────────

    const getNestedValue = (obj: any, path: string, defaultValue = null) =>
    {
        try {
            return path.split('.').reduce((cur: any, key: string) =>
                cur == null ? defaultValue : cur[key], obj) ?? defaultValue;
        } catch { return defaultValue; }
    };

    const handleChangeProduct = (rowIndex: number, effectiveCategoryId: string) =>
    {
        const updatedData = [...tableData];
        updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            categoryId: effectiveCategoryId,
            product: { id: '', name: '', centralStock: 0, minStock: 0 },
        };
        setTableData(updatedData);
        onDataChange?.(updatedData);
        setPickerRowIndex(rowIndex);
        setPickerCategoryId(effectiveCategoryId);
        setPickerSearch('');
    };

    const renderCellValue = (column: Column, value: any, row: StoreRequestItem, rowIndex: number) =>
    {
        if (column.key === 'product.name')
        {
            const effectiveCategoryId = row.categoryId || row.product?.categoryId || row.product?.category?.id || '';

            return (
                <div className={styles.productCellWrapper}>
                    <select
                        value={effectiveCategoryId}
                        onChange={e => handleCategoryChange(rowIndex, e.target.value)}
                        className={styles.categoryselect}
                    >
                        <option value="">Selecciona categoría...</option>
                        {(categories || []).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {row.product?.id && (
                        <div className={styles.selectedProductBadge}>
                            <span>✓ {row.product.name}</span>
                            <button
                                className={styles.changePill}
                                onClick={() => handleChangeProduct(rowIndex, effectiveCategoryId)}
                                title="Cambiar producto"
                            >×</button>
                        </div>
                    )}
                </div>
            );
        }

        if (column.key === 'requestStock')
        {
            return (
                <input
                    type="number"
                    min="1"
                    value={row.requestStock}
                    onChange={e => updateRequestStock(rowIndex, parseInt(e.target.value) || 1)}
                    className={styles.productinput}
                />
            );
        }

        if (column.key === 'returnReason')
        {
            return (
                <select
                    value={value || ''}
                    onChange={e => updateReturnReason(rowIndex, e.target.value as ReturnReason)}
                    className={styles.productselect}
                >
                    <option value="">Selecciona una razón</option>
                    {Object.values(ReturnReason).map(reason => (
                        <option key={reason} value={reason}>{returnReasonLabels[reason] || reason}</option>
                    ))}
                </select>
            );
        }

        return value;
    };

    // ── Panel de productos ────────────────────────────────────────────────────

    const pickerCategoryName = categories?.find(c => c.id === pickerCategoryId)?.name;
    const currentSelectedProductId = pickerRowIndex !== null ? tableData[pickerRowIndex]?.product?.id : '';

    const pickerProducts = (products || [])
        .filter(p => p.available !== false)
        .filter(p => p.categoryId === pickerCategoryId)
        .filter(p => !pickerSearch || p.name.toLowerCase().includes(pickerSearch.toLowerCase()));

    const renderProductPanel = () =>
    {
        if (pickerRowIndex === null) return null;

        return (
            <div className={styles.productPanel}>
                <div className={styles.productPanelHeader}>
                    <span className={styles.productPanelTitle}>
                        Productos — <strong>{pickerCategoryName}</strong>
                    </span>
                    <button className={styles.productPanelClose} onClick={() => { setPickerRowIndex(null); setPickerSearch(''); }}>
                        ✕
                    </button>
                </div>
                <input
                    type="text"
                    className={styles.pickerSearch}
                    placeholder="Buscar producto..."
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    autoFocus
                />
                <div className={styles.pickerProductList}>
                    {pickerProducts.length > 0 ? (
                        pickerProducts.map(product => (
                            <button
                                key={product.id}
                                className={`${styles.pickerProductItem} ${product.id === currentSelectedProductId ? styles.pickerProductItemActive : ''}`}
                                onClick={() => handleProductSelect(product)}
                            >
                                {product.name}
                            </button>
                        ))
                    ) : (
                        <p className={styles.pickerEmpty}>Sin productos en esta categoría</p>
                    )}
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────

    const { pageLabels = { showing: "Mostrando", of: "de" } } = config;

    const tableContent = (
        <table className={styles.dataTable}>
            <thead>
                <tr>
                    {config.columns.map(col => (
                        <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.header}</th>
                    ))}
                    <th style={{ width: '10%' }}>ACCIONES</th>
                </tr>
            </thead>
            <tbody>
                {tableData.length === 0 ? (
                    <tr>
                        <td colSpan={config.columns.length + 1} className={styles.emptyTableMessage}>
                            <button onClick={addNewRow} className={styles.addproductbutton}>
                                Añadir Producto
                            </button>
                        </td>
                    </tr>
                ) : (
                    currentItems.map((item, rowIndex) => (
                        <tr key={rowIndex} className={pickerRowIndex === indexOfFirstItem + rowIndex ? styles.rowActive : ''}>
                            {config.columns.map(column => (
                                <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                    {renderCellValue(column, getNestedValue(item, column.key), item, indexOfFirstItem + rowIndex)}
                                </td>
                            ))}
                            <td>
                                <div className={styles.actionButtons}>
                                    <button onClick={addNewRow} title="Añadir fila"><AddItem /></button>
                                    <button onClick={() => removeRow(indexOfFirstItem + rowIndex)} title="Eliminar fila"><Trash /></button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );

    return (
        <div className={styles.tableContainer}>
            {tableContent}
            {renderProductPanel()}
            <div className={styles.pagination}>
                <span>
                    {pageLabels.showing} {tableData.length === 0 ? '0-0' : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, tableData.length)}`} {pageLabels.of} {tableData.length}
                </span>
                <div className={styles.paginationControls}>
                    <button onClick={goToPreviousPage} disabled={currentPage === 1 || tableData.length === 0} className={styles.paginationButton}>&lt;</button>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages || tableData.length === 0} className={styles.paginationButton}>&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default ModalTable;
