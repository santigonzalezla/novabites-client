'use client';

import styles from './inventorymodal.module.css';
import { MouseEvent, useEffect, useState } from 'react';
import ModalTable, { StoreRequestItem } from '@/app/components/inventory/modaltable/ModalTable';
import { useFetch } from '@/hooks/useFetch';
import mockData from '@/app/components/shared/data/mockData.json';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Store, StoreRequest } from '@/interfaces/interfaces';
import { RequestStatus, RequestType, TypeStore } from '@/interfaces/enums';

interface InventoryModalProps {
    onClose: () => void;
}

const InventoryModal = ({ onClose }: InventoryModalProps) =>
{
    const { user } = useAuth();
    const [activeOption, setActiveOption] = useState('request');
    const [selectedTargetStore, setSelectedTargetStore] = useState<string>('');
    const [storeList, setStoreList] = useState<Store[]>([]);
    const [storeRequestData, setStoreRequestData] = useState<StoreRequestItem[]>([]);
    const [storeReturnData, setStoreReturnData] = useState<StoreRequestItem[]>([]);
    const [storeRelocateData, setStoreRelocateData] = useState<StoreRequestItem[]>([]);
    const {data, isLoading, error} = useFetch('/api/product');
    const {isLoading: isStoreRequestLoading, error: storeRequestError, execute} = useFetch('/api/store-request', {
        immediate: false
    });
    const { data: storeData, isLoading: isStoreLoading, error: storeError, execute: executeStore} = useFetch<Store[]>('/api/store', {
        immediate: false
    });

    useEffect(() =>
    {
        const fetchStores = async () =>
        {
            const stores = await executeStore();

            if (stores)
            {
                const filteredStores = stores.filter((store: Store) =>
                    store.type !== TypeStore.PRINCIPAL && store.id !== user?.storeId
                );

                setStoreList(filteredStores);
            }
        }

        fetchStores();
    }, []);

    const handleOverlayClick = () =>
    {
        onClose();
    };

    const handleContainerClick = (e: MouseEvent<HTMLDivElement>) =>
    {
        e.stopPropagation();
    };

    const isDataComplete = (data: StoreRequestItem[]): boolean =>
    {
        if (data.length === 0) return false;

        return data.every(item =>
        {
            const hasProduct = item.product && item.product.id && item.product.id !== '';
            const hasQuantity = item.requestStock && item.requestStock > 0;
            const hasReturnReason = activeOption === 'return' ? (item.returnReason && item.returnReason.trim() !== '') : true;

            return hasProduct && hasQuantity && hasReturnReason;
        });
    };

    const handleDataChange = (newData: StoreRequestItem[]) =>
    {
        if (activeOption === 'request')
        {
            setStoreRequestData(newData);
        }
        else if (activeOption === 'return')
        {
            setStoreReturnData(newData);
        }
        else
        {
            setStoreRelocateData(newData);
        }
    };

    const createRequest = async (request: StoreRequestItem[]) =>
    {
        if (!isDataComplete(request))
        {
            toast.error("Debes rellenar todos los campos de la solicitud", {
                description: "Asegúrate de que la solicitud está completa antes de enviarla.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const details = request.map((item: any) => ({
            productId: item.product.id,
            requestedQuantity: item.requestStock,
            unitPrice: item.product.basePrice,
            totalPrice: (item.product.basePrice as number) * item.requestStock
        }));

        const centralStore = storeData?.find(store => store.type === TypeStore.PRINCIPAL);

        const storeRequest: Partial<StoreRequest> = {
            type: RequestType.SUPPLY_REQUEST,
            status: RequestStatus.PENDING,
            requestingStoreId: user?.storeId,
            requestingUserId: user?.userId,
            targetStoreId: centralStore?.id,
            requestedDate: new Date().toISOString(),
            details: details
        }

        try
        {
            const newStoreRequest = await execute({
                method: 'POST',
                body: storeRequest
            });

            if (newStoreRequest && !storeRequestError)
            {
                toast.success("Pedido a tienda creado correctamente", {
                    description: "El pedido ha sido creada con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                onClose();
            }
        }
        catch (e)
        {
            console.error("Error al crear el pedido:", e);
            toast.error(`Error al crear el pedido: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const createReturn = async (request: StoreRequestItem[]) =>
    {
        if (!isDataComplete(request))
        {
            toast.error("Debes rellenar todos los campos de la devolución", {
                description: "Asegúrate de que la devolución está completa antes de enviarla.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const details = request.map((item: any) => ({
            productId: item.product.id,
            requestedQuantity: item.requestStock,
            unitPrice: item.product.basePrice,
            totalPrice: (item.product.basePrice as number) * item.returnStock,
            returnReason: item.returnReason
        }));

        const centralStore = storeData?.find(store => store.type === TypeStore.PRINCIPAL);

        const storeReturn: Partial<StoreRequest> = {
            type: RequestType.RETURN_REQUEST,
            status: RequestStatus.PENDING,
            requestingStoreId: user?.storeId,
            requestingUserId: user?.userId,
            targetStoreId: centralStore?.id,
            requestedDate: new Date().toISOString(),
            details: details
        }

        try
        {
            const newStoreReturn = await execute({
                method: 'POST',
                body: storeReturn
            });

            if (newStoreReturn && !storeRequestError)
            {
                toast.success("Devolución a tienda creada correctamente", {
                    description: "La devolución ha sido creada con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                onClose();
            }
        }
        catch (e)
        {
            console.error("Error al crear la devolución:", e);
            toast.error(`Error al crear la devolución: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const createRelocation = async (request: StoreRequestItem[]) =>
    {
        if (!selectedTargetStore)
        {
            toast.error("Debes seleccionar una tienda destino", {
                description: "Selecciona la tienda a la que deseas reubicar los productos.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        if (!isDataComplete(request))
        {
            toast.error("Debes rellenar todos los campos de la reubicación", {
                description: "Asegúrate de que los datos de la reubicación estén completos antes de enviarla.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const details = request.map((item: any) => ({
            productId: item.product.id,
            requestedQuantity: item.requestStock,
            unitPrice: item.product.basePrice,
            totalPrice: (item.product.basePrice as number) * item.returnStock
        }));

        const storeReturn: Partial<StoreRequest> = {
            type: RequestType.RELOCATION_REQUEST,
            status: RequestStatus.PENDING,
            requestingStoreId: user?.storeId,
            requestingUserId: user?.userId,
            targetStoreId: selectedTargetStore,
            requestedDate: new Date().toISOString(),
            details: details
        }

        try
        {
            const newStoreReturn = await execute({
                method: 'POST',
                body: storeReturn
            });

            if (newStoreReturn && !storeRequestError)
            {
                toast.success("Reubicación a tienda creada correctamente", {
                    description: "La reubicación ha sido creada con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                setSelectedTargetStore('');
                setStoreRelocateData([]);

                onClose();
            }
        }
        catch (e)
        {
            console.error("Error al crear la reubicación:", e);
            toast.error(`Error al crear la reubicación: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={handleContainerClick}>
                <div className={styles.modalContainer}>
                    <div className={styles.modaltop}>
                        <div className={styles.modaltitle}>
                            <h1>Pedido a Central de Distribución</h1>
                            <p>Revise los productos a pedir y las devoluciones antes de enviar.</p>
                        </div>
                        <div className={styles.modalselector}>
                            <button
                                className={`${styles.selectorButton} ${activeOption === 'request' ? styles.active : ''}`}
                                onClick={() => setActiveOption('request')}
                            >
                                Solicitud
                            </button>
                            <button
                                className={`${styles.selectorButton} ${activeOption === 'return' ? styles.active : ''}`}
                                onClick={() => setActiveOption('return')}
                            >
                                Devolución
                            </button>
                            <button
                                className={`${styles.selectorButton} ${activeOption === 'relocation' ? styles.active : ''}`}
                                onClick={() => setActiveOption('relocation')}
                            >
                                Reubicación
                            </button>
                        </div>
                    </div>
                    <div className={styles.table}>
                        {activeOption === 'request' ? (
                            <ModalTable
                                data={storeRequestData}
                                products={data}
                                config={mockData.storeRequest.config}
                                onDataChange={handleDataChange}
                            />
                        ) : (activeOption === 'return') ? (
                            <div className={styles.returnTable}>
                                <ModalTable
                                    data={storeReturnData}
                                    products={data}
                                    config={mockData.storeReturn.config}
                                    onDataChange={handleDataChange}
                                />
                            </div>
                        ) : (
                            <div className={styles.relocationTable}>
                                <select
                                    id="targetStore"
                                    value={selectedTargetStore}
                                    onChange={(e) => setSelectedTargetStore(e.target.value)}
                                    className={styles.storeSelect}
                                    disabled={isStoreLoading}
                                >
                                    <option value="">
                                        {isStoreLoading ? 'Cargando tiendas...' : 'Selecciona una tienda'}
                                    </option>
                                    {storeList.map((store: any) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                                <ModalTable
                                    data={storeRelocateData}
                                    products={data}
                                    config={mockData.storeRelocation.config}
                                    onDataChange={handleDataChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className={styles.modalbuttons}>
                        <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                        <button
                            className={styles.sendButton}
                            onClick={() => activeOption === 'request'
                                ? createRequest(storeRequestData)
                                : activeOption === 'return' ? createReturn(storeReturnData) : createRelocation(storeRelocateData)}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryModal;