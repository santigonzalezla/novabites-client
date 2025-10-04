import './dashboard.css';
import type {Metadata} from "next";
import {satoshi} from "@/app/fonts/satoshi";
import {APP_DESCRIPTION, APP_NAME, SERVER_URL} from "@/lib/constants";
import { ReactNode, Suspense } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

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
        <div className={`${satoshi.variable} antialiased fulldashboard`}>
            <ThemeProvider>
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </ThemeProvider>
        </div>
    );
}

