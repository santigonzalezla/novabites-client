import styles from './userdropdown.module.css';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { List, Logout, User } from '@/app/components/svg';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/interfaces/enums';
import Link from 'next/link';

const UserDropdown = () =>
{
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleProfileClick = () => setIsOpen(false);

    const handleLogoutClick = () =>
    {
        setIsOpen(false);
        logout();
    }

    useEffect(() =>
    {
        const handleClickOutside = (event: MouseEvent) =>
        {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className={styles.toprightuser} ref={dropdownRef} onClick={toggleDropdown}>
            <Image src={"/user.png"} alt={"User"} width={35} height={35}
                   style={{ borderRadius: "12px", objectFit: "cover"}}
            />
            <div className={styles.toprightusertitle}>
                <h2>{user?.name}</h2>
                <p>{user?.role === Role.MANAGER ? "Gerente" : user?.role === Role.ADMIN ? "Administrador" : "Usuario"}</p>
            </div>
            {isOpen && (
                <div className={styles.dropdown}>
                    <Link className={styles.dropdownItem} onClick={handleProfileClick} href={'/dashboard/profile'}>
                        <User />
                        <span>Perfil</span>
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                    <Link className={styles.dropdownItem} onClick={handleProfileClick} href={'/dashboard/orderslist'}>
                        <List />
                        <span>Ordenes</span>
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                    <div className={styles.dropdownItem} onClick={handleLogoutClick}>
                        <Logout />
                        <span>Cerrar sesión</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDropdown;