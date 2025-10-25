'use client';

import Topbar from '@/app/components/sales/topbar/Topbar';
import styles from './page.module.css';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import SalesCart from '@/app/components/sales/salescart/SalesCart';
import ProductItem from '@/app/components/sales/productitem/ProductItem';
import { useEffect, useMemo, useState } from 'react';
import PaymentModal from '@/app/components/sales/paymentmodal/PaymentModal';
import { useFetch } from '@/hooks/useFetch';
import {
    Product,
    CategoryProduct,
    Order,
    DetailOrder,
    StoreProduct,
    SubcategoryProduct,
} from '@/interfaces/interfaces';
import { StatusOrder } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FilterCat } from '@/app/components/svg';

const Sales = () =>
{
    const { user } = useAuth();
    const { data, isLoading, error } = useFetch<Product[]>('/api/product');
    const [storeProductList, setStoreProductList] = useState<StoreProduct[]>([]);
    const { isLoading: isStoreProductLoading, error: storeProductError, execute: executeStoreProduct } = useFetch<StoreProduct[]>(`/api/store-product/store/${user?.storeId}`, {
        immediate: false,
    });
    const { error: orderError, execute: orderExecute } = useFetch('/api/order', {
        immediate: false
    });
    const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useFetch('/api/category-product');
    const [selectedCategory, setSelectedCategory] = useState<Partial<CategoryProduct>>({ id: "", name: "" });
    const [selectedSubcategory, setSelectedSubcategory] = useState<Partial<SubcategoryProduct> | null>(null);
    const [cartItems, setCartItems] = useState<Partial<Product>[]>([]);
    const [quantities, setQuantities] = useState<{[productId: string]: number}>({});
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [orderData, setOrderData] = useState({
        paymentMethod: "",
        total: 0,
    });

    useEffect(() =>
    {
        const fetchStoreProducts = async () =>
        {
            const storeProducts = await executeStoreProduct();

            if (!storeProductError && storeProducts)
            {
                setStoreProductList(storeProducts);
            }
        }
        fetchStoreProducts();
    }, []);

    const availableProducts = useMemo(() =>
    {
        if (!data || !storeProductList) return [];

        const storeProductIds = new Set(
            storeProductList
                .filter(sp => sp.available && sp.currentStock > 0)
                .map(sp => sp.productId)
        );

        return data.filter(product => storeProductIds.has(product.id));
    }, [data, storeProductList]);

    const availableCategories = useMemo(() =>
    {
        if (!categoryData || !availableProducts.length) return [];

        const categoryIds = new Set(availableProducts.map(product => product.categoryId));

        return categoryData.filter((category: { id: string | undefined; }) => categoryIds.has(category.id));
    }, [categoryData, availableProducts]);

    const categoryInfo = useMemo(() =>
    {
        if (!selectedCategory.id || !availableProducts.length)
        {
            return {
                subcategories: [],
                hasSubcategories: false,
                productsWithSubcategory: [],
                productsWithoutSubcategory: []
            };
        }

        const categoryProducts = availableProducts.filter(p => p.categoryId === selectedCategory.id);
        const productsWithSubcategory = categoryProducts.filter(p => p.subcategoryId);
        const productsWithoutSubcategory = categoryProducts.filter(p => !p.subcategoryId);

        const category = availableCategories.find((cat: any) => cat.id === selectedCategory.id);
        const subcategories = category?.subcategories || [];

        const availableSubcategories = subcategories.filter((sub: any) => categoryProducts.some(p => p.subcategoryId === sub.id));

        const hasSubcategories = availableSubcategories.length > 0;

        return {
            subcategories: availableSubcategories,
            hasSubcategories,
            productsWithSubcategory,
            productsWithoutSubcategory,
            allProducts: categoryProducts
        };
    }, [selectedCategory, availableProducts, availableCategories]);


    useEffect(() =>
    {
        if (availableCategories && availableCategories.length > 0)
        {
            setSelectedCategory({
                id: availableCategories[0].id,
                name: availableCategories[0].name,
            });
        }
    }, [availableCategories]);

    useEffect(() =>
    {
        if (categoryInfo.hasSubcategories && categoryInfo.subcategories.length > 0) setSelectedSubcategory(categoryInfo.subcategories[0]);
        else if (!categoryInfo.hasSubcategories) setSelectedSubcategory(null);
    }, [categoryInfo]);

    const handleCategoryChange = (id: string, name: string) =>
    {
        setSelectedCategory({ id, name });
        setSelectedSubcategory(null);
    }

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const subcategoryId = e.target.value;

        if (subcategoryId === 'others') setSelectedSubcategory({ id: 'others', name: 'Otros' } as SubcategoryProduct);
        else if (subcategoryId === '') setSelectedSubcategory(null);
        else
        {
            const subcategory = categoryInfo.subcategories.find((sub: SubcategoryProduct) => sub.id === subcategoryId);
            if (subcategory) setSelectedSubcategory(subcategory);
        }
    }

    const filteredProducts = useMemo(() =>
    {
        if (!selectedCategory.id) return [];
        if (!categoryInfo.hasSubcategories) return categoryInfo.allProducts
        if (!selectedSubcategory) return categoryInfo.allProducts;
        if (selectedSubcategory.id === 'others') return categoryInfo.productsWithoutSubcategory;

        return availableProducts.filter(p =>
            p.categoryId === selectedCategory.id &&
            p.subcategoryId === selectedSubcategory.id
        );
    }, [selectedCategory, selectedSubcategory, categoryInfo, availableProducts]);

    const getProductStock = (productId: string) =>
    {
        const storeProduct = storeProductList?.find(sp => sp.productId === productId);

        return { currentStock: storeProduct?.currentStock || 0, price: storeProduct?.price || '0' };
    };

    const addToCart = (product: Partial<Product>) =>
    {
        const stockInfo = getProductStock(product.id!);

        if (stockInfo.currentStock <= 0)
        {
            toast.error("Producto sin stock", {
                description: "Este producto no tiene stock disponible.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const currentQuantity = quantities[product.id!] || 0;

        if (currentQuantity >= stockInfo.currentStock) {
            toast.error("Stock insuficiente", {
                description: `Solo hay ${stockInfo.currentStock} unidades disponibles.`,
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

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
        const stockInfo = getProductStock(productId);

        if (newQuantity <= 0)
        {
            setCartItems(cartItems.filter((item) => item.id !== productId));
            setQuantities((prev) => {
                const newQuantities = { ...prev };
                delete newQuantities[productId];
                return newQuantities;
            });
        }
        else if (newQuantity > stockInfo.currentStock)
        {
            toast.error("Stock insuficiente", {
                description: `Solo hay ${stockInfo.currentStock} unidades disponibles.`,
                duration: 3000,
                richColors: true,
                position: 'top-right'
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
                    categories={availableCategories   || []}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
                {categoryInfo.hasSubcategories && (
                    <div className={styles.subcategoryDropdown}>
                        <label htmlFor="subcategory-select"><FilterCat /></label>
                        <select
                            id="subcategory-select"
                            value={selectedSubcategory?.id || ''}
                            onChange={handleSubcategoryChange}
                            className={styles.subcategorySelect}
                        >
                            {categoryInfo.subcategories.map((subcategory: SubcategoryProduct) => (
                                <option key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </option>
                            ))}
                            {categoryInfo.productsWithoutSubcategory.length > 0 && (
                                <option value="others">Otros</option>
                            )}
                        </select>
                    </div>
                )}
                <div className={styles.grid}>
                    {filteredProducts?.map((item, index) =>
                    {
                        const stockInfo = getProductStock(item.id);
                        return (
                            <ProductItem
                                key={index}
                                product={{
                                    ...item,
                                    centralStock: stockInfo.currentStock,
                                    basePrice: item.basePrice
                                }}
                                onAddToCart={() => addToCart(item)}
                            />
                        );
                    })}
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