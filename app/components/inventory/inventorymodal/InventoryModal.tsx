'use client';

import styles from './inventorymodal.module.css';
import { MouseEvent, useState } from 'react';
import ModalTable, { StoreRequestItem } from '@/app/components/inventory/modaltable/ModalTable';
import { useFetch } from '@/hooks/useFetch';
import mockData from '@/app/components/shared/data/mockData.json';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { StoreRequest } from '@/interfaces/interfaces';
import { RequestStatus, RequestType } from '@/interfaces/enums';

interface InventoryModalProps {
    onClose: () => void;
}

const InventoryModal = ({ onClose }: InventoryModalProps) =>
{
    const { user } = useAuth();
    const [activeOption, setActiveOption] = useState('request');
    const [storeRequestData, setStoreRequestData] = useState<StoreRequestItem[]>([]);
    const [storeReturnData, setStoreReturnData] = useState<StoreRequestItem[]>([]);
    const {data, isLoading, error} = useFetch('/api/product');
    const {isLoading: isStoreRequestLoading, error: storeRequestError, execute} = useFetch('/api/store-request', {
        immediate: false
    });

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
        else
        {
            setStoreReturnData(newData);
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

        const storeRequest: Partial<StoreRequest> = {
            type: RequestType.SUPPLY_REQUEST,
            status: RequestStatus.PENDING,
            requestingStoreId: user?.storeId,
            requestingUserId: user?.userId,
            targetStoreId: '550e8400-e29b-41d4-a716-446655440101',
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

        const storeReturn: Partial<StoreRequest> = {
            type: RequestType.RETURN_REQUEST,
            status: RequestStatus.PENDING,
            requestingStoreId: user?.storeId,
            requestingUserId: user?.userId,
            targetStoreId: '550e8400-e29b-41d4-a716-446655440101',
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
                        ) : (
                            <div className={styles.returnTable}>
                                <ModalTable
                                    data={storeReturnData}
                                    products={data}
                                    config={mockData.storeReturn.config}
                                    onDataChange={handleDataChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className={styles.modalbuttons}>
                        <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                        <button
                            className={styles.sendButton}
                            onClick={() => activeOption === 'request' ? createRequest(storeRequestData) : createReturn(storeReturnData)}
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