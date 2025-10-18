'use client';

import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/interfaces/auth';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) =>
{
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const publicRoutes = ['/', '/signin', '/signup', '/forgotpassword', '/resetpassword'];

    useEffect(() =>
    {
        const tokenFromCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('authToken='))
            ?.split('=')[1];

        const token = tokenFromCookie || localStorage.getItem('authToken');

        if (token)
        {
            try
            {
                const payload = JSON.parse(atob(token.split('.')[1]));

                if (payload.exp * 1000 < Date.now())
                {
                    console.warn('Token expired, logging out');
                    logout();
                    return;
                }

                setUser({ userId: payload.userId, name: payload.name, username: payload.username, role: payload.role, storeId: payload.storeId });

                if (!publicRoutes.includes(pathname)) router.push('/dashboard');
            }
            catch (e)
            {
                console.error('Failed to parse token on login', e);
                logout();
            }
        }
        else
        {
            if (!publicRoutes.includes(pathname)) router.push('/signin');
        }

        setIsLoading(false);
    }, []);

    useEffect(() =>
    {
        if (!user) return;

        const interval = setInterval(() =>
        {
            const token = localStorage.getItem('authToken');

            if (token)
            {
                try
                {
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    if (payload.exp * 1000 < Date.now())
                    {
                        console.warn('Token expired during session, logging out');
                        logout();
                    }
                }
                catch (e)
                {
                    console.error('Failed to verify token expiration', e);
                    logout();
                }
            }
            else
            {
                logout();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    const login = (token: string) =>
    {
        document.cookie = `authToken=${token}; path=/; max-age=86400; secure; samesite=strict`;
        localStorage.setItem('authToken', token);

        try
        {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ userId: payload.userId, name: payload.name, username: payload.username, role: payload.role, storeId: payload.storeId });
            router.push('/dashboard');
        }
        catch (e)
        {
            console.error('Failed to parse token on login', e);
        }
    }

    const logout = () =>
    {
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        localStorage.removeItem('authToken');
        setUser(null);
        router.push('/');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () =>
{
    const context = useContext(AuthContext);

    if (context === undefined) throw new Error('useAuth must be within an AuthProvider');

    return context;
}