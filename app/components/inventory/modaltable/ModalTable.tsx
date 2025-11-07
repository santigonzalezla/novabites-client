'use client';

import styles from './modaltable.module.css';
import { AddItem, Trash } from '@/app/components/svg';
import { ReactNode, useState } from 'react';
import { Product } from '@/interfaces/interfaces';
import { ReturnReason } from '@/interfaces/enums';

export type StoreRequestItem = {
    product: Partial<Product>;
    requestStock?: number;
    returnReason?: ReturnReason;
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
    config: TableConfig;
    onDataChange?: (data: StoreRequestItem[]) => void;
}

const ModalTable = ({ data, products, config, onDataChange }: ModalTableProps) =>
{
    const [currentPage, setCurrentPage] = useState(1);
    const [tableData, setTableData] = useState<StoreRequestItem[]>(data || []);
    const itemsPerPage = config.itemsPerPage || 10;

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = tableData.length > 0 ? Math.ceil(tableData.length / itemsPerPage) : 1;

    // Cambiar página
    const goToNextPage = () =>
    {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    }

    const goToPreviousPage = () =>
    {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    }

    const addNewRow = () =>
    {
        const newItem: StoreRequestItem = {
            product: { id: '', name: '', centralStock: 0, minStock: 0 }, // Producto vacío
            requestStock: 1
        };

        const updatedData = [...tableData, newItem];
        setTableData(updatedData);
        onDataChange?.(updatedData);
    }

    // Actualizar producto seleccionado
    const updateProduct = (index: number, productId: string) =>
    {
        const selectedProduct = products?.find(p => p.id === productId);

        if (selectedProduct)
        {
            const updatedData = [...tableData];
            updatedData[index] = {
                ...updatedData[index],
                product: selectedProduct
            };
            setTableData(updatedData);
            onDataChange?.(updatedData);
        }
    }

    // Actualizar cantidad solicitada
    const updateRequestStock = (index: number, value: number) =>
    {
        const updatedData = [...tableData];

        updatedData[index] = {
            ...updatedData[index],
            requestStock: value
        };
        setTableData(updatedData);
        onDataChange?.(updatedData);
    }

    const updateReturnReason = (index: number, value: ReturnReason) =>
    {
        const updatedData = [...tableData];

        updatedData[index] = {
            ...updatedData[index],
            returnReason: value
        };
        setTableData(updatedData);
        onDataChange?.(updatedData);
    }

    const removeRow = (index: number) =>
    {
        const updatedData = tableData.filter((_, i) => i !== index);
        setTableData(updatedData);
        onDataChange?.(updatedData);
    }

    const getNestedValue = (obj: any, path: string, defaultValue = null) =>
    {
        try
        {
            return path.split('.').reduce((current: { [x: string]: any; } | null | undefined, key: string | number) =>
            {
                if (current === null || current === undefined) return defaultValue;
                return current[key];
            }, obj) ?? defaultValue;
        }
        catch (error)
        {
            return defaultValue;
        }
    };

    // Renderizar celda personalizada
    const renderCellValue = (column: Column, value: any, row: StoreRequestItem, rowIndex: number) =>
    {
        if (column.key === 'product.name')
        {
            return (
                <select
                    value={row.product.id || ''}
                    onChange={(e) => updateProduct(rowIndex, e.target.value)}
                    className={styles.productselect}
                >
                    <option value="">Selecciona un producto</option>
                    {products?.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            );
        }

        if (column.key === 'requestStock')
        {
            return (
                <input
                    type="number"
                    min="1"
                    value={row.requestStock}
                    onChange={(e) => updateRequestStock(rowIndex, parseInt(e.target.value) || 1)}
                    className={styles.productinput}
                />
            );
        }

        if (column.key === 'returnReason')
        {
            return (
                <select
                    value={value || ''}
                    onChange={(e) => updateReturnReason(rowIndex, e.target.value as ReturnReason)}
                    className={styles.productselect}
                >
                    <option value="">Selecciona una razón</option>
                    {Object.values(ReturnReason).map(reason => (
                        <option key={reason} value={reason}>
                            {reason}
                        </option>
                    ))}
                </select>
            );
        }

        return value;
    }

    const { pageLabels = { showing: "Mostrando", of: "de" } } = config;

    // Si no hay datos, mostrar fila con botón añadir
    if (tableData.length === 0)
    {
        return (
            <div className={`${styles.tableContainer}`}>
                <table className={styles.dataTable}>
                    <thead>
                    <tr>
                        {config.columns.map((column) => (
                            <th
                                key={column.key}
                                style={column.width ? { width: column.width } : {}}
                            >
                                {column.header}
                            </th>
                        ))}
                        <th style={{ width: '10%' }}>ACCIONES</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td
                            colSpan={config.columns.length + 1}
                            className={styles.emptyTableMessage}
                        >
                            <button
                                onClick={addNewRow}
                                className={styles.addproductbutton}
                            >
                                Añadir Producto
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <span>
                        {pageLabels.showing} 0-0 {pageLabels.of} 0
                    </span>
                    <div className={styles.paginationControls}>
                        <button disabled className={styles.paginationButton}>
                            &lt;
                        </button>
                        <button disabled className={styles.paginationButton}>
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.tableContainer}`}>
            <table className={styles.dataTable}>
                <thead>
                <tr>
                    {config.columns.map((column) => (
                        <th
                            key={column.key}
                            style={column.width ? { width: column.width } : {}}
                        >
                            {column.header}
                        </th>
                    ))}
                    <th style={{ width: '10%' }}>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {config.columns.map((column) => (
                            <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                {renderCellValue(column, getNestedValue(item, column.key), item, indexOfFirstItem + rowIndex)}
                            </td>
                        ))}
                        <td>
                            <div className={styles.actionButtons}>
                                <button
                                    onClick={addNewRow}
                                    title="Añadir fila"
                                >
                                    <AddItem />
                                </button>
                                <button
                                    onClick={() => removeRow(indexOfFirstItem + rowIndex)}
                                    title="Eliminar fila"
                                >
                                    <Trash />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <span>
                    {pageLabels.showing} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, tableData.length)} {pageLabels.of} {tableData.length}
                </span>
                <div className={styles.paginationControls}>
                    <button onClick={goToPreviousPage} disabled={currentPage === 1} className={styles.paginationButton}>
                        &lt;
                    </button>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className={styles.paginationButton}>
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalTable;