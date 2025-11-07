'use client';

import { useState } from 'react';
import styles from './expensestable.module.css';
import { DailyExpense } from '@/interfaces/interfaces';
import { ExpenseCategory } from '@/interfaces/enums';

import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { Plus, Trash } from '@/app/components/svg';
import { PendingExpense } from '@/app/(root)/dashboard/expense/page';

interface ExpensesTableProps {
    expenses: DailyExpense[];
    setExpenses: (expenses: DailyExpense[]) => void;
    pendingExpenses: PendingExpense[];
    setPendingExpenses: (expenses: PendingExpense[]) => void;
    storeId: string;
    selectedDate: string;
    isLoading: boolean;
    isToday: boolean;
}

const ExpensesTable = ({ expenses, setExpenses, pendingExpenses, setPendingExpenses, storeId, selectedDate, isLoading, isToday }: ExpensesTableProps) =>
{
    const { execute: executeExpense } = useFetch('/api/daily-expense', { immediate: false });

    const categoryLabels: Record<ExpenseCategory, string> = {
        [ExpenseCategory.RENT]: 'Arriendo',
        [ExpenseCategory.UTILITIES]: 'Servicios Públicos',
        [ExpenseCategory.SERVICES]: 'Servicios',
        [ExpenseCategory.MAINTENANCE]: 'Mantenimiento',
        [ExpenseCategory.SUPPLIES]: 'Suministros',
        [ExpenseCategory.OTHER]: 'Otro'
    };

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    };

    const handleAddRow = () =>
    {
        if (!isToday)
        {
            toast.error('No permitido', {
                description: 'Solo puedes agregar gastos al día actual',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const tempId = `temp-${Date.now()}`;
        setPendingExpenses([
            ...pendingExpenses,
            {
                tempId,
                category: ExpenseCategory.OTHER,
                description: '',
                amount: ''
            }
        ]);
    };

    const handleUpdatePendingExpense = (tempId: string, field: keyof PendingExpense, value: string) =>
    {
        setPendingExpenses(pendingExpenses.map(exp => exp.tempId === tempId ? { ...exp, [field]: value } : exp));
    };

    const handleRemovePendingExpense = (tempId: string) =>
    {
        setPendingExpenses(pendingExpenses.filter(exp => exp.tempId !== tempId));
    };

    const handleDeleteExpense = async (id: string) =>
    {
        if (!isToday)
        {
            toast.error('No permitido', {
                description: 'Solo puedes eliminar gastos del día actual',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

        try
        {
            await executeExpense({
                method: 'DELETE'
            }, `/api/daily-expense/${id}`);

            setExpenses(expenses.filter(exp => exp.id !== id));

            toast.success('Gasto eliminado', {
                description: 'El gasto se eliminó correctamente',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        catch (error)
        {
            console.error('Error eliminando gasto:', error);
            toast.error('Error al eliminar', {
                description: 'No se pudo eliminar el gasto',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const totalExpenses = [...expenses, ...pendingExpenses
        .map(exp => ({ amount: exp.amount ? parseFloat(exp.amount) : 0 }))]
        .reduce((sum, expense) =>
        {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

    if (isLoading) return <p>Cargando gastos...</p>;

    return (
        <div className={styles.expensesContainer}>
            <div className={styles.tableHeader}>
                <button
                    className={styles.addButton}
                    onClick={handleAddRow}
                    disabled={!isToday}
                    title={!isToday ? 'Solo puedes agregar gastos al día actual' : ''}
                >
                    <Plus />
                    Agregar Gasto
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.expensesTable}>
                    <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Gastos guardados */}
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td><span className={styles.categoryBadge}>{categoryLabels[expense.category]}</span></td>
                            <td>{expense.description}</td>
                            <td className={styles.rightText}>{formatPrice(expense.amount)}</td>
                            <td>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDeleteExpense(expense.id)}
                                        disabled={!isToday}
                                        title={!isToday ? 'Solo puedes eliminar gastos del día actual' : ''}
                                    >
                                        <Trash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Nuevos gastos (pendientes de guardar) */}
                    {pendingExpenses.map((pendingExpense) => (
                        <tr key={pendingExpense.tempId} className={styles.newRow}>
                            <td>
                                <select
                                    value={pendingExpense.category}
                                    onChange={(e) => handleUpdatePendingExpense(pendingExpense.tempId, 'category', e.target.value)}
                                    className={styles.input}
                                >
                                    {Object.values(ExpenseCategory).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {categoryLabels[cat]}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={pendingExpense.description}
                                    onChange={(e) => handleUpdatePendingExpense(pendingExpense.tempId, 'description', e.target.value)}
                                    className={styles.input}
                                    placeholder="Descripción del gasto"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={pendingExpense.amount}
                                    onChange={(e) => handleUpdatePendingExpense(pendingExpense.tempId, 'amount', e.target.value)}
                                    className={styles.input}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </td>
                            <td>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleRemovePendingExpense(pendingExpense.tempId)}
                                    >
                                        <Trash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Mensaje vacío */}
                    {expenses.length === 0 && pendingExpenses.length === 0 && (
                        <tr>
                            <td colSpan={4} className={styles.emptyMessage}>
                                No hay gastos registrados. Haz clic en "Agregar Gasto" para comenzar.
                            </td>
                        </tr>
                    )}

                    {/* Fila de total */}
                    {(expenses.length > 0 || pendingExpenses.length > 0) && (
                        <tr className={styles.totalRow}>
                            <td colSpan={2}><strong>Total Gastos</strong></td>
                            <td className={styles.rightText}>
                                <strong>{formatPrice(totalExpenses)}</strong>
                            </td>
                            <td></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {pendingExpenses.length > 0 && (
                <div className={styles.pendingNote}>
                    <p>⚠️ Tienes {pendingExpenses.length} gasto(s) pendiente(s). Se guardarán al realizar el cierre de caja.</p>
                </div>
            )}

            {!isToday && expenses.length === 0 && (
                <div className={styles.historyNote}>
                    <p>ℹ️ Este es el historial de gastos del día seleccionado. Solo puedes agregar o eliminar gastos del día actual.</p>
                </div>
            )}
        </div>
    );
};

export default ExpensesTable;