import styles from './cartitem.module.css';
import Image from 'next/image';
import { Minus, Plus, Remove } from '@/app/components/svg';

interface CartItemProps {
    image: string;
    title: string;
    price: number;
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}

const CartItem = ({ image, title, price, quantity, onIncrease, onDecrease, onRemove }: CartItemProps) =>
{
    return (
        <div className={styles.cartitem}>
            <div className={styles.cartitemleft}>
                <Image
                    src={image || '/placeholder.jpg'}
                    alt={image}
                    width={60}
                    height={60}
                    style={{objectFit: "cover", border: '1px solid #e0e0e0', borderRadius: '50%'}}
                />
                <div className={styles.cartiteminfo}>
                    <span>{title}</span>
                    <div className={styles.counter}>
                        <button onClick={onDecrease}><Minus /></button>
                        <p>{quantity}</p>
                        <button onClick={onIncrease}><Plus /></button>
                    </div>
                </div>
            </div>
            <div className={styles.cartitemright}>
                <span>${(price*quantity)}</span>
                <Remove onClick={onRemove} styles={{cursor: 'pointer'}} />
            </div>
        </div>
    );
}

export default CartItem;