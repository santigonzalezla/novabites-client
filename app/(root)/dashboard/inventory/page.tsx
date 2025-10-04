'use client';

import styles from './page.module.css';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import InventoryTable from '@/app/components/inventory/inventorytable/InventoryTable';
import { useEffect, useState } from 'react';
import InventoryModal from '@/app/components/inventory/inventorymodal/InventoryModal';
import mockData from '@/app/components/shared/data/mockData.json';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { StoreProduct } from '@/interfaces/interfaces';
import { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericFilter from '@/app/components/shared/genericfilter/GenericFilter';

interface InventoryConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const Inventory = () =>
{
    const { user } = useAuth();
    const storeId = user?.storeId;
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [config, setConfig] = useState<InventoryConfig>({columns: []});
    const [inventoryData, setInventoryData] = useState<StoreProduct[]>([]);
    const [filteredData, setFilteredData] = useState<StoreProduct[]>([]);
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { data, isLoading, error, execute } = useFetch<StoreProduct[]>(`/api/store-product/store/${storeId}`, {
        immediate: false
    });
    const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useFetch(`/api/category-product`);

    const filterConfig = [
        { field: 'product.name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'product.category.name', placeholder: 'Categoria', label: 'categoria' },
        { field: 'status', placeholder: 'Estado', label: 'estado' }
    ]

    useEffect(() =>
    {
        const fetchProducts = async () =>
        {
            const products = await execute();

            if (products)
            {
                setInventoryData(products);
                const filtered = filterItems(products, currentFilters);
                setFilteredData(filtered);
            }
        }

        fetchProducts();
        setConfig(mockData.inventory.config);
    }, []);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(inventoryData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(inventoryData); // Mostrar todos los datos sin filtrar
    };

    const handleOpenPaymentModal = () =>
    {
        setIsInventoryModalOpen(true);
    }

    const handleClosePaymentModal = () =>
    {
        setIsInventoryModalOpen(false);
    }

    return (
        <div className={styles.inventory}>
            <div className={styles.top}>
                <BackButton />
                <h1>Gestiona tu Inventario!</h1>
            </div>
            <div className={styles.orderoptions}>
                <div className={styles.orderoptionsleft}>
                    <GenericFilter
                        filterConfig={filterConfig}
                        onFilterChange={handleFilterChange}
                        onResetFilters={handleResetFilters}
                    />
                </div>
                <button className={styles.orderoptionsbutton} onClick={handleOpenPaymentModal}>Generar Solicitud</button>
            </div>
            <InventoryTable
                data={filteredData}
                config={config}
            />
            {isInventoryModalOpen && (
                <InventoryModal
                    onClose={handleClosePaymentModal}
                />
            )}
        </div>
    );
}

export default Inventory;