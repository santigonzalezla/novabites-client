import './globals.css'
import { Toaster } from 'sonner';
import { ReactNode } from 'react';
import type {Metadata} from "next";
import {satoshi} from "@/app/fonts/satoshi";
import { AuthProvider } from '@/context/AuthContext';
import {APP_DESCRIPTION, APP_NAME, SERVER_URL} from "@/lib/constants";

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({children}: Readonly<{ children: ReactNode;}>)
{
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${satoshi.variable} antialiased`}>
                <AuthProvider>
                    <Toaster />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

