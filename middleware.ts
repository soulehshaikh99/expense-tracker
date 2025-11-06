import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSessionFromCookie } from '@/lib/auth';

const SESSION_COOKIE_NAME = 'auth-session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and API auth routes without authentication
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const cookieValue = sessionCookie?.value;

  // Check if cookie exists and has a valid value (not empty string)
  if (!cookieValue || cookieValue.trim() === '') {
    // No valid session cookie, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session token
  if (validateSessionFromCookie(cookieValue)) {
    return NextResponse.next();
  }

  // Invalid or expired session, redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - but we'll handle /api/auth/ in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

