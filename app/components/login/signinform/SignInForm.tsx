'use client';

import styles from './signinform.module.css';
import Link from 'next/link';
import React, { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { satoshi } from '@/app/fonts/satoshi';
import { useLogin } from '@/hooks/useFetch';

const SignInForm = () =>
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { loginUser, isLoading, error } = useLogin();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        if (!username || !password) {
            console.error("Username y password son requeridos");
            return;
        }

        const success = await loginUser(username, password);

        (success)
            ? toast.success("Inicio de Sesión exitoso!", {
                description: "Bienvenido de nuevo!",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            })
            : toast.error(error || "Error al iniciar sesión. Revisa tus credenciales.", {
                description: "Inténtalo de nuevo.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formTop}>
                <h1>Accede a tu cuenta</h1>
                <p><span>¡Bienvenido de vuelta!</span> Accede a tu cuenta y continuemos construyendo juntos un gran día.</p>
            </div>
            <div className={styles.formInput}>
                <label htmlFor="username" className={styles.label}>Username:</label>
                <input
                    type="email"
                    name="username"
                    id="username"
                    placeholder="test@test.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className={styles.formInput}>
                <label htmlFor="password" className={styles.label}>Contraseña:</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    minLength={6}
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className={styles.checkboxContainer}>
                <div>
                    <input
                        id="remember"
                        type="checkbox"
                        className={styles.checkbox}
                    />
                    <label htmlFor="remember" className={styles.rememberLabel}>Recuerdame</label>
                </div>
                <Link className={styles.forgotPassword} href={'/dashboard'}>
                    ¿Olvidaste Tu Contraseña?
                </Link>
            </div>
            <button type="submit" className={`${satoshi.variable} antialiased ${styles.loginButton}`} disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
}

export default SignInForm;