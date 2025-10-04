'use client';

import { ReactNode, useState } from 'react';
import styles from "./inventorytable.module.css";
import { StoreProduct } from '@/interfaces/interfaces';

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

type DataTableProps = {
    data: StoreProduct[];
    config: TableConfig;
}

const InventoryTable = ({ data, config }: DataTableProps ) =>
{
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = config.itemsPerPage || 10;
    const statusArr =  [
        "available",
        "unavailable",
        "completed",
        "processing",
        "pending",
        "rejected",
        "cancelled",
        "canceled",
        "on hold",
        "active",
        "inactive",
        "suspended",
        "out of stock",
        "in stock",
        "low stock"
    ];

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = data ?  Math.ceil(data.length / itemsPerPage) : 1;

    // Cambiar página
    const goToNextPage = () =>
    {
        if (currentPage < totalPages)
        {
            setCurrentPage(currentPage + 1);
        }
    }

    const goToPreviousPage = () =>
    {
        if (currentPage > 1)
        {
            setCurrentPage(currentPage - 1);
        }
    }

    // Renderizar badge de estado con color correspondiente
    const renderStatusBadge = (status: string) =>
    {
        let badgeClass: string;

        switch (status.toLowerCase())
        {
            case "available":
                badgeClass = styles.statusCompleted;
                break;
            case "unavailable":
                badgeClass = styles.statusRejected;
                break;
            case "completed":
                badgeClass = styles.statusCompleted;
                break;
            case "processing":
                badgeClass = styles.statusProcessing;
                break;
            case "pending":
                badgeClass = styles.statusOnHold;
                break;
            case "cancelled":
                badgeClass = styles.statusRejected;
                break;
            case "canceled":
                badgeClass = styles.statusRejected;
                break;
            case "rejected":
                badgeClass = styles.statusRejected;
                break;
            case "on hold":
                badgeClass = styles.statusOnHold;
                break;
            case "suspended":
                badgeClass = styles.statusOnHold;
                break;
            case "active":
                badgeClass = styles.statusCompleted;
                break;
            case "inactive":
                badgeClass = styles.statusRejected;
                break;
            case "out of stock":
                badgeClass = styles.statusRejected;
                break;
            case "in stock":
                badgeClass = styles.statusCompleted;
                break;
            case "low stock":
                badgeClass = styles.statusOnHold;
                break;
            default:
                badgeClass = styles.statusDefault;
        }

        return (<span className={`${styles.statusBadge} ${badgeClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>)
    }

    const renderDateValue = (dateString: string) =>
    {
        try
        {
            const date = new Date(dateString);

            // Formato: DD/MM/YYYY HH:mm
            const formattedDate = date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'});

            return <span className={styles.dateValue}>{formattedDate}</span>;
        }
        catch (error)
        {
            return dateString; // Sí hay error, mostrar valor original
        }
    };

    // Renderizar valor de celda basado en la configuración de columna
    const renderCellValue = (column: Column, value: any, row: any) =>
    {
        if (column.renderType === 'date' && typeof value === 'string')
        {
            return renderDateValue(value);
        }

        if (typeof value === 'string' && statusArr.includes(value.toLowerCase()))
        {
            return renderStatusBadge(value);
        }

        if (typeof value === 'boolean')
        {
            return (value ? renderStatusBadge("Available") : renderStatusBadge("Unavailable"));
        }

        if (column.render)
        {
            return column.render(value, row);
        }

        return value;
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

    const { pageLabels = { showing: "Mostrando", of: "de" } } = config;

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
                </tr>
                </thead>
                <tbody>
                {currentItems ? (
                    currentItems.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {config.columns.map((column) => (
                                <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                    {renderCellValue(column, getNestedValue(item, column.key), item)}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={config.columns.length} className={styles.emptyTableMessage}>
                            No hay datos disponibles
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <span>
                    {pageLabels.showing} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data?.length as number)} {pageLabels.of} {data?.length}
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

export default InventoryTable;