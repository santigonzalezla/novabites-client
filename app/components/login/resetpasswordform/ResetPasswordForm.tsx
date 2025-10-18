'use client';

import styles from './resetpasswordform.module.css';
import { satoshi } from "@/app/fonts/satoshi";
import Link from "next/link";
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { useSearchParams, useRouter } from 'next/navigation';

const ResetPasswordForm = () =>
{
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { execute, isLoading } = useFetch('/api/auth/reset-password', {
        method: 'POST',
        immediate: false
    });

    useEffect(() =>
    {
        const tokenFromUrl = searchParams.get('token')
        if (!tokenFromUrl)
        {
            toast.error("Token inválido", {
                description: "El enlace de recuperación no es válido.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            })
        }
        setToken(tokenFromUrl);
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        if (!token)
        {
            toast.error("Token inválido", {
                description: "El enlace de recuperación no es válido.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            return;
        }

        if (!newPassword || !confirmPassword)
        {
            toast.error("Todos los campos son requeridos", {
                description: "Por favor completa todos los campos.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            return;
        }

        if (newPassword.length < 6)
        {
            toast.error("Contraseña muy corta", {
                description: "La contraseña debe tener al menos 6 caracteres.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            return;
        }

        if (newPassword !== confirmPassword)
        {
            toast.error("Las contraseñas no coinciden", {
                description: "Por favor verifica que ambas contraseñas sean iguales.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
            return;
        }

        try
        {
            const result = await execute({
                body: {
                    token: token,
                    newPassword: newPassword
                }
            });

            if (result)
            {
                toast.success("Contraseña restablecida exitosamente!", {
                    description: "Ya puedes iniciar sesión con tu nueva contraseña.",
                    duration: 3000,
                    richColors: true,
                    position: "top-right",
                });

                setNewPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    router.push('/signin')
                }, 2000);
            }
        }
        catch (error: any)
        {
            toast.error("Error al restablecer contraseña", {
                description: error.message || "Por favor intenta de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: "top-right",
            });
        }
    }

    return (
        <form className={`${satoshi.variable} ${styles.form}`} onSubmit={handleSubmit}>
            <div className={styles.formTop}>
                <h1>Restablecer Contraseña</h1>
                <p className={styles.subtitle}>Ingresa tu nueva contraseña y confírmala para completar el proceso.</p>
            </div>
            <div className={styles.formInput}>
                <label htmlFor="newPassword" className={styles.label}>
                    Nueva Contraseña
                </label>
                <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    minLength={6}
                    placeholder="******"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formInput}>
                <label htmlFor="confirmPassword" className={styles.label}>
                    Confirmar Contraseña
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    minLength={6}
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className={`${satoshi.variable} antialiased ${styles.loginButton}`} disabled={isLoading || !token}>
                {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
            </button>
            <div className={styles.backToLogin}>
                <Link href="/signin" className={styles.backLink}>
                    <ArrowLeft /> Volver al inicio de sesión
                </Link>
            </div>
        </form>
    )
}

export default ResetPasswordForm;