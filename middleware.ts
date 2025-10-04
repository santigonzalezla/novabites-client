import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/interfaces/enums';

const protectedPaths = [
    '/dashboard',
    '/dashboard/inventory',
    '/dashboard/order',
    '/dashboard/sales'
]

export const middleware = (request: NextRequest) =>
{
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('authToken')?.value;

    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected)
    {
        if (!token) return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|$).*)',
    ]
}