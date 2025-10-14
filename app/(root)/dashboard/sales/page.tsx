'use client';

import Topbar from '@/app/components/sales/topbar/Topbar';
import styles from './page.module.css';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import SalesCart from '@/app/components/sales/salescart/SalesCart';
import ProductItem from '@/app/components/sales/productitem/ProductItem';
import { useEffect, useState } from 'react';
import PaymentModal from '@/app/components/sales/paymentmodal/PaymentModal';
import { useFetch } from '@/hooks/useFetch';
import { Product, CategoryProduct, Order, DetailOrder } from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Sales = () =>
{
    const { user } = useAuth();
    const { data, isLoading, error } = useFetch<Product[]>('/api/product');
    const { error: orderError, execute: orderExecute } = useFetch('/api/order', {
        immediate: false
    });
    const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useFetch('/api/category-product');
    const [selectedCategory, setSelectedCategory] = useState<Partial<CategoryProduct>>({ id: "", name: "" });
    const [cartItems, setCartItems] = useState<Partial<Product>[]>([]);
    const [quantities, setQuantities] = useState<{[productId: string]: number}>({});
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [orderData, setOrderData] = useState({
        paymentMethod: "",
        total: 0,
    });

    useEffect(() =>
    {
        if (categoryData && categoryData.length > 0)
        {
            setSelectedCategory({
                id: categoryData[0].id,
                name: categoryData[0].name,
            });
        }
    }, [categoryData, setSelectedCategory]);

    const filteredProducts = data?.filter((product) => (product.categoryId === selectedCategory.id)) || [];

    const addToCart = (product: Partial<Product>) =>
    {
        if (!cartItems.find(item => item.id === product.id))
        {
            setCartItems([...cartItems, product]);
            setQuantities(prev => ({ ...prev, [product.id!]: 1 }));
        }
        else
        {
            setQuantities(prev => ({ ...prev, [product.id!]: (prev[product.id!] || 0) + 1 }));
        }
    }

    const updateQuantity = (productId: string, newQuantity: number) =>
    {
        if (newQuantity <= 0)
        {
            setCartItems(cartItems.filter((item) => item.id !== productId));
            setQuantities((prev) => {
                const newQuantities = { ...prev };
                delete newQuantities[productId];
                return newQuantities;
            });
        }
        else
        {
            setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
        }
    }

    const clearCart = () =>
    {
        setCartItems([]);
        setQuantities({});
    }

    const handleCategoryChange = (id: string, name: string) =>
    {
        setSelectedCategory({ id, name });
    }

    const calculateTotal = () =>
    {
        return (
            cartItems.reduce((total, item) =>
            {
                const quantity = quantities[item.id!] || 0;
                const itemPrice = Number(item?.basePrice) || 0;
                return total + (itemPrice * quantity);
            }, 0)
        )
    }

    const handleOpenPaymentModal = () =>
    {
        setOrderData({
            ...orderData,
            total: calculateTotal(),
        });
        setIsPaymentModalOpen(true);
    }

    const handleClosePaymentModal = () =>
    {
        setIsPaymentModalOpen(false);
        clearCart();
    }
    
    const handleCreateOrder = async (order: any) =>
    {
        const newOrder: Partial<Order> = {
            details: order.cartItems.map((item: Product) => ({
                productId: item.id,
                quantity: order.quantities[item.id] || 0,
                price: Number(item.basePrice) * (order.quantities[item.id] || 0),
            })) as DetailOrder[],
            totalPrice: String(order.total),
            status: StatusOrder.COMPLETED,
            ...(order?.clientId && { clientId: order.clientId }),
            storeId: user?.storeId,
            userId: user?.userId,
            paymentMethod: order.paymentMethod,
            ...(order?.amountReceived !== undefined && { amountReceived: order.amountReceived }),
            ...(order?.change !== undefined && { change: order.change }),
        }

        try
        {
            const newOrderResult = await orderExecute({
                method: 'POST',
                body: newOrder,
            });

            if (!orderError && newOrderResult)
            {
                toast.success("Order creada correctamente", {
                    description: "La order ha sido creada exitosamente.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                return newOrderResult;
            }

            return null;
        }
        catch (e)
        {
            console.error("Error al crear la order:", e);
            toast.error("Error al crear la order", {
                description: "Ha ocurrido un error al crear la order. Inténtalo de nuevo.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    return (
        <div className={styles.sales}>
            <div className={styles.left}>
                <div className={styles.top}>
                    <BackButton />
                    <h1>Gestiona tus Ventas!</h1>
                </div>
                <Topbar
                    categories={categoryData  || []}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
                <div className={styles.grid}>
                    {filteredProducts?.map((item, index) => (
                        <ProductItem
                            key={index}
                            product={item}
                            onAddToCart={() => addToCart(item)}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.right}>
                <SalesCart
                    cartItems={cartItems || []}
                    setCartItems={setCartItems}
                    quantities={quantities}
                    onUpdateQuantity={updateQuantity}
                    onClearCart={clearCart}
                    total={calculateTotal()}
                    onPayClick={handleOpenPaymentModal}
                />
            </div>

            {isPaymentModalOpen && (
                <PaymentModal
                    handleCreateOrder={handleCreateOrder}
                    orderData={orderData}
                    setOrderData={setOrderData}
                    quantities={quantities}
                    cartItems={cartItems}
                    onClose={handleClosePaymentModal}
                />
            )}
        </div>
    );
}

export default Sales;