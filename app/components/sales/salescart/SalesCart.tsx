import styles from './salescart.module.css';
import { ArrowGo, Minus, Plus, Remove, Trash } from '@/app/components/svg';
import Image from 'next/image';
import CartItem from '@/app/components/sales/cartitem/CartItem';
import { Product } from '@/interfaces/interfaces';
import { toast } from 'sonner';

interface SalesCartProps {
    cartItems: Partial<Product>[];
    quantities: { [productId: string]: number };
    setCartItems: (items: Partial<Product>[]) => void;
    onUpdateQuantity: (productId: string, newQuantity: number) => void;
    onClearCart: () => void;
    total: number;
    onPayClick: () => void;
}

const SalesCart = ({ cartItems, quantities, setCartItems, onUpdateQuantity, onClearCart, total, onPayClick }: SalesCartProps) =>
{
    return (
        <div className={styles.salescart}>
            <div className={styles.salescartcont}>
                <div className={styles.salescarttop}>
                    <h1>Nueva Orden</h1>
                    <Trash onClick={onClearCart} style={{cursor: 'pointer'}}/>
                </div>
                <div className={styles.cartcontainer}>
                    {cartItems.map((item, index) => (
                        <CartItem
                            key={item.id || index}
                            image={item.imageUrl || ''}
                            title={item.name || ''}
                            price={Number(item.basePrice) || 0}
                            quantity={quantities[item.id!] || 0}
                            onIncrease={() => onUpdateQuantity(item.id!, quantities[item.id!] + 1)}
                            onDecrease={() => onUpdateQuantity(item.id!, quantities[item.id!] - 1)}
                            onRemove={() => onUpdateQuantity(item.id!, 0)}
                        />
                    ))}
                </div>
            </div>
            <button
                className={styles.cartbutton}
                onClick={
                    cartItems.length > 0 ? onPayClick : () => toast.warning('El carrito está vacío', {
                        description: 'Agrega productos para continuar con el pago.',
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    })
                }
            >
                <span>${total}</span>
                <p className={styles.cartbuttontext}>
                    <span>Pagar</span>
                    <ArrowGo />
                </p>
            </button>
        </div>
    );
}

export default SalesCart;