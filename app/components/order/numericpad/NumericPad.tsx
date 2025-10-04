'use client';

import styles from './numericpad.module.css';
import { useState } from 'react';

const NumericPad = () =>
{
    const [value, setValue] = useState('2.00');

    const handleNumberClick = (num: string) =>
    {
        if (num === '0' && value === '0') return;

        // Handle decimal logic
        if (value.includes('.')) {
            const [intPart, decimalPart] = value.split('.');
            if (decimalPart.length < 2) {
                setValue(value + num);
            }
        } else {
            setValue(value === '0' ? num : value + num);
        }
    };

    const handleClear = () =>
    {
        setValue('0');
    };

    return (
        <div className={styles.container}>
            <h2>Recibido</h2>
            <div className={styles.displayValue}>{value}</div>
            <div className={styles.numpad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        className={styles.numpadButton}
                        onClick={() => handleNumberClick(num.toString())}
                    >
                        {num}
                    </button>
                ))}
                <button
                    className={styles.clearButton}
                    onClick={handleClear}
                >
                    C
                </button>
                <button
                    className={styles.numpadButton}
                    onClick={() => handleNumberClick('0')}
                >
                    0
                </button>
                <button
                    className={styles.clearButton}
                    onClick={handleClear}
                >
                    X
                </button>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.printButton}>Imprimir Recibo</button>
                <button className={styles.applyButton}>Aplicar</button>
            </div>
        </div>
    );
};

export default NumericPad;