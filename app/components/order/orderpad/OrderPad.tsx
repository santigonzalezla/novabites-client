import styles from './orderpad.module.css';
import NumericPad from '@/app/components/order/numericpad/NumericPad';

const OrderPad = () =>
{
    return (
        <div className={styles.modalcontent}>
            <NumericPad />
        </div>
    );
}

export default OrderPad;