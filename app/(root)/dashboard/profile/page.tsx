'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { User as UserData } from '@/interfaces/interfaces';
import { Key, Options } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { Role, TypeContract } from '@/interfaces/enums';
import { toast } from 'sonner';
import BackButton from '@/app/components/shared/backbutton/BackButton';
import Topbar from '@/app/components/dashboard/topbar/Topbar';
import UserDropdown from '@/app/components/dashboard/userdropdown/UserDropdown';

const Profile = () =>
{
    const { user } = useAuth();
    const { data, error, execute } = useFetch<UserData>(`/api/user/${user?.userId}`);
    const [showOptions, setShowOptions] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() =>
    {
        if (error)
        {
            console.error("Error al cargar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }

        const fetchData = async () =>
        {
            const userData = await execute();

            if (userData)
            {
                setUserData(userData);
            }
        }

        fetchData();
    }, []);

    const transformValue = (value: Role | TypeContract | null | undefined) =>
    {
        switch (value)
        {
            case Role.ADMIN:
                return 'Administrador';
            case Role.MANAGER:
                return 'Gerente';
            case Role.USER:
                return 'Usuario';
            case TypeContract.INDEFINITE:
                return 'Termino Indefinido';
            case TypeContract.FIXED_TERM:
                return 'Termino Fijo';
            case TypeContract.INTERNSHIP:
                return 'Prácticas';
            case TypeContract.TEMPORARY:
                return 'Temporal';
            case TypeContract.PART_TIME:
                return 'Medio Tiempo';
            default:
                return value || 'N/A';
        }
    }

    const capitalizeText = (text: string) =>
    {
        if (!text) return 'N/A';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const formatDate = (date: Date | string | null | undefined) =>
    {
        if (!date) return 'N/A';
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }).format(dateObj);
    }

    const handlePasswordChangeRequest = () =>
    {
        toast.info("Solicitud de cambio de contraseña", {
            description: "Se ha enviado una solicitud al administrador para cambiar tu contraseña.",
            duration: 3000,
            richColors: true,
            position: 'top-right'
        });
        // Aquí puedes implementar la lógica real para enviar la solicitud
        setShowOptions(false);
    };

    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>Cargando...</div>;

    return (
        <div className={styles.profile}>
            <div className={styles.top}>
                <div className={styles.topleft}>
                    <BackButton />
                    <h1>Gestiona tu Perfil</h1>
                </div>
                <UserDropdown />
            </div>
            <div className={styles.profileContainer}>
                <div className={styles.profileContent}>
                    <div className={styles.profileHeader}>
                        <div className={styles.imageContainer}>
                            <div className={styles.productImage}>
                                <Image
                                    src={userData?.userDetails?.imageUrl || "/user.png"}
                                    alt="user img"
                                    width={150}
                                    height={150}
                                    className={styles.logoImg}
                                />
                            </div>
                        </div>

                        <div className={styles.optionsContainer}>
                            <button
                                className={styles.optionsButton}
                                onClick={() => setShowOptions(!showOptions)}
                            >
                                <Options />
                            </button>

                            {showOptions && (
                                <div className={styles.optionsMenu}>
                                    <button
                                        className={styles.optionItem}
                                        onClick={handlePasswordChangeRequest}
                                    >
                                        <Key />
                                        Solicitar Cambio de Contraseña
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formContainer}>
                        <div className={styles.form}>
                            {/* Sección: Información del Usuario */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Información del Usuario</h2>
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Nombre Completo
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.name || 'N/A'}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Correo Electrónico
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.email || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Teléfono
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.phone || 'N/A'}
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Documento
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.typeId} {userData.docId}
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Fecha de Nacimiento
                                            </label>
                                            <div className={styles.displayValue}>
                                                {formatDate(userData.userDetails?.birthDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Información Laboral */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Información Laboral</h2>
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Rol
                                            </label>
                                            <div className={styles.displayValue}>
                                                {transformValue(userData.role)}
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Tienda
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.store?.name || 'N/A'}
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Estado
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.status || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Cargo
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.userDetails?.position
                                                    ? capitalizeText(userData.userDetails.position)
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Tipo de Contrato
                                            </label>
                                            <div className={styles.displayValue}>
                                                {transformValue(userData.userDetails?.typeContract)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Dirección */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Ubicación</h2>
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Ciudad
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.userDetails?.city || 'N/A'}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Dirección
                                            </label>
                                            <div className={styles.displayValue}>
                                                {userData.userDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Fechas de registro */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Información del Sistema</h2>
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Fecha de Registro
                                            </label>
                                            <div className={styles.displayValue}>
                                                {formatDate(userData.createdAt)}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Última Actualización
                                            </label>
                                            <div className={styles.displayValue}>
                                                {formatDate(userData.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;