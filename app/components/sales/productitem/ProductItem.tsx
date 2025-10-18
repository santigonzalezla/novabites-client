import styles from './productitem.module.css';
import Image from 'next/image';
import { Product } from '@/interfaces/interfaces';

interface ProductItemProps {
    product: Partial<Product>;
    onAddToCart: (product: Partial<Product>) => void;
}

const ProductItem = ({ product, onAddToCart }: ProductItemProps) =>
{
    return (
        <div className={styles.productitem} onClick={() => onAddToCart(product)}>
            <div className={styles.imagecontainer}>
                <div className={styles.imagecircle}>
                    <Image
                        src={product?.imageUrl || "/placeholder.jpg"}
                        alt={product?.imageUrl || "Product Image"}
                        width={100}
                        height={100}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                    />
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.price}>$ {product.basePrice}</p>
            </div>
        </div>

    );
}

export default ProductItem;