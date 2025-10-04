import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UseFetchOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    immediate?: boolean;
    responseType?: 'json' | 'blob';
    isFormData?: boolean;
}

interface UseFetchResults<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    execute: (options?: Partial<UseFetchOptions>, overrideUrl?: string) => Promise<T | null>;
    reset: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://novabites-production.up.railway.app/';

export const useFetch = <T = any>(url: string, options: UseFetchOptions = {}): UseFetchResults<T> =>
{
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { logout } = useAuth();

    const stableOptions = useMemo(() => options, [
        options.method,
        options.immediate,
        options.body,
        options.responseType,
        options.isFormData,
        JSON.stringify(options.headers)
    ])

    const execute = useCallback(async (overrideOptions: Partial<UseFetchOptions> = {}, overrideUrl?: any): Promise<T | null> =>
    {
        setIsLoading(true);
        setError(null);

        try
        {
            const token = localStorage.getItem('authToken');
            const mergedOptions = { ...options, ...overrideOptions };

            const urlToUse = overrideUrl || url;

            const isFormData = mergedOptions.isFormData || false;

            const headers: Record<string, string> = {
                ...mergedOptions.headers,
            }

            if (!isFormData) headers['Content-Type'] = 'application/json';

            if (token) headers.Authorization = `Bearer ${token}`;

            const fetchOptions: RequestInit = {
                method: mergedOptions.method || 'GET',
                headers,
            }

            if (mergedOptions.body && mergedOptions.method !== 'GET')
            {
                (isFormData)
                    ? fetchOptions.body = mergedOptions.body
                    : fetchOptions.body = JSON.stringify(mergedOptions.body);
            }

            const response = await fetch(`${API_BASE_URL}${urlToUse}`, fetchOptions);

            if (response.status === 401)
            {
                logout();
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            if (!response.ok)
            {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error {${response.status} al realizar la solicitud: ${response.statusText}`);
            }

            let  responseData:T;

            (mergedOptions.responseType === 'blob')
                ? responseData = await response.blob() as T
                : responseData = await response.json();

            setData(responseData);
            return responseData;
        }
        catch (e)
        {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido al realizar la solicitud';
            setError(errorMessage);
            console.error(errorMessage);

            return null;
        }
        finally
        {
            setIsLoading(false);
        }

    }, [url, stableOptions, logout]);

    const reset = useCallback(() =>
    {
        setData(null);
        setIsLoading(false);
        setError(null);
    }, [])

    useEffect(() =>
    {
        if (stableOptions.immediate !== false) execute();

    }, [execute, stableOptions.immediate]);


    return { data, isLoading, error, execute, reset };
}

export const useLogin = () =>
{
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginUser = async (username: string, password: string) =>
    {
        setError(null);
        setIsLoading(true);

        try
        {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido al iniciar sesión' }));
                throw new Error(errorData.message || `Error al iniciar sesión: ${response.statusText}`);
            }

            const token = await response.text();
            login(token);

            return true;
        }
        catch (e)
        {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido al iniciar sesión';
            setError(errorMessage);

            return false;
        }
        finally
        {
            setIsLoading(false);
        }
    }

    return { loginUser, isLoading, error }
}