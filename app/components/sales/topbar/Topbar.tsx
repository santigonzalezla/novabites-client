'use client';

import styles from './topbar.module.css';
import { useState } from 'react';
import { CategoryProduct } from '@/interfaces/interfaces';

interface TopbarProps {
    categories: CategoryProduct[];
    selectedCategory: Partial<CategoryProduct>;
    onCategoryChange: (id: string, name: string) => void;
}

const Topbar = ({ categories, selectedCategory, onCategoryChange }: TopbarProps) =>
{
    return (
        <div className={styles.topbar}>
            {categories.map((category) => (
                <div
                    key={category.name}
                    className={`${styles.topbaroption} ${selectedCategory.name === category.name ? styles.active : ''}`}
                    onClick={() => onCategoryChange(category.id, category.name)}
                >
                    {category.name}
                </div>
            ))}
        </div>
    );
}

export default Topbar;