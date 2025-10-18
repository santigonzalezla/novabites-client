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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #14667C',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Verificando autenticación...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) return null;

    return <>{children}</>;
}

export default AuthGuard;