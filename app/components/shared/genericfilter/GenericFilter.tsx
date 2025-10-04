'use client';

import { useState } from 'react';
import styles from './genericfilter.module.css';
import { ArrowDown, Filter, Reset } from '@/app/components/svg';

export type FilterConfig = {
    field: string;
    placeholder: string;
    label: string;
}

type DynamicFilterProps = {
    filterConfig: FilterConfig[];
    onFilterChange: (filters: Record<string, string>) => void;
    onResetFilters: () => void;
}

const getNestedValue = (obj: any, path: string): string =>
{
    const value = path.split('.').reduce((current, key) =>
    {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);

    // Convertir a string para comparación
    return value !== null && value !== undefined ? String(value) : '';
};

export const filterItems = (items: any[], filters: Record<string, string>): any[] => {

    if (!filters || Object.keys(filters).length === 0) return items;

    return items.filter(item =>
    {
        return Object.entries(filters).every(([field, filterValue]) =>
        {
            if (!filterValue || filterValue.trim() === '') return true;

            const itemValue = getNestedValue(item, field);

            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        });
    });
};

const GenericFilter = ({ filterConfig, onFilterChange, onResetFilters }: DynamicFilterProps) =>
{
    const [filters, setFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (field: string, value: string) =>
    {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleResetFilters = () =>
    {
        setFilters({});
        onResetFilters();
    };

    return (
        <div className={styles.filter}>
            <div className={styles.filtericon}>
                <Filter />
            </div>
            <div className={styles.filterby}>
                <span>Filtrar por</span>
            </div>

            {filterConfig.map((config) => (
                <div key={config.field} className={styles.filtercontent}>
                    <input
                        type="text"
                        placeholder={config.placeholder}
                        value={filters[config.field] || ''}
                        onChange={(e) => handleFilterChange(config.field, e.target.value)}
                        aria-label={`Filtrar por ${config.label}`}
                    />
                    <ArrowDown />
                </div>
            ))}

            <div className={styles.filterreset} onClick={handleResetFilters}>
                <Reset />
                Limpiar Filtro
            </div>
        </div>
    );
};

export default GenericFilter;