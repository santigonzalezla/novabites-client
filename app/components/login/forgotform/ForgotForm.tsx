'use client';

import styles from './forgotform.module.css';
import { satoshi } from "@/app/fonts/satoshi";
import Link from "next/link";
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { APP_URL } from '@/lib/constants';

const ForgotForm = () =>
{
    const [email, setEmail] = useState("");
    const { execute, isLoading } = useFetch('/api/auth/request-password-reset', {
        method: 'POST',
        immediate: false
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        if (!email)
        {
            toast.error("El correo electrónico es requerido", {
                description: "Por favor ingresa tu correo.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            return;
        }

        try
        {
            console.log(email, APP_URL);
            const result = await execute({
                body: {
                    email,
                    appUrl: APP_URL,
                }
            });

            if (result)
            {
                toast.success("¡Correo enviado!", {
                    description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
                    duration: 4000,
                    richColors: true,
                    position: "top-right",
                });
                setEmail("");
            }
        }
        catch (e)
        {
            toast.error("Error al enviar el correo", {
                description: "Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            console.error(e);
        }
    }


    return (
        <form className={`${satoshi.variable} ${styles.form}`} onSubmit={handleSubmit}>
            <div className={styles.formTop}>
                <h1>Recuperar Contraseña</h1>
                <p className={styles.subtitle}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>
            <div className={styles.formInput}>
                <label htmlFor="email" className={styles.label}>
                    Correo Electrónico
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="test@test.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className={`${satoshi.variable} antialiased ${styles.loginButton}`} disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </button>
            <div className={styles.backToLogin}>
                <Link href="/signin" className={styles.backLink}>
                    <ArrowLeft /> Volver al inicio de sesión
                </Link>
            </div>
        </form>
    )
}

export default ForgotForm

