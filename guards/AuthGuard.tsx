'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles = [] }) =>
{
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() =>
    {
        if (isLoading)
        {
            if (pathname == '/')
            {
                if (!isAuthenticated)
                {
                    router.push('/signin');
                    return;
                }

                if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))
                {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [isAuthenticated, user, isLoading, router, allowedRoles]);

    if (isLoading)
    {
        return (
            <div>
                <p>Verificando Autenticación...</p>
            </div>
        );
    }

    if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) return null;

    return <>{children}</>;
}

export default AuthGuard;