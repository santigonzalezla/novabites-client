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
                    width={75}
                    height={60}
                    style={{objectFit: "cover"}}
                />
                <div style={{width: 60, height: 60, border: '1px solid #000', borderRadius:'50%' }}></div>
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
                <span>${(price*quantity).toFixed(2)}</span>
                <Remove onClick={onRemove} styles={{cursor: 'pointer'}} />
            </div>
        </div>
    );
}

export default CartItem;