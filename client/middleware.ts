import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

// Mobile routes that require student authentication
const MOBILE_PROTECTED_PREFIXES = [
  '/mobile/dashboard',
  '/mobile/request',
  '/mobile/transaction',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Handle mobile route protection (cookie-based JWT)
  if (MOBILE_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const sessionCookie = req.cookies.get('mobile-session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/mobile/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle admin dashboard protection (NextAuth)
  if (pathname.startsWith('/dashboard')) {
    if (!req.auth) {
      const url = req.url.replace(req.nextUrl.pathname, '/');
      return Response.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/mobile/dashboard/:path*', '/mobile/request/:path*', '/mobile/transaction/:path*'],
};
