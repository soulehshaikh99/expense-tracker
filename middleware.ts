import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get credentials from environment variables
  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  // If credentials are not set, allow access (for development without auth)
  if (!basicAuthUser || !basicAuthPassword) {
    return NextResponse.next();
  }

  // Get Authorization header
  const authorizationHeader = request.headers.get('authorization');

  // Check if Authorization header exists and is valid
  if (authorizationHeader) {
    const authValue = authorizationHeader.split(' ')[1];
    if (authValue) {
      // Decode base64 in Edge runtime compatible way
      const decoded = atob(authValue);
      const [user, password] = decoded.split(':');

      // Validate credentials
      if (user === basicAuthUser && password === basicAuthPassword) {
        return NextResponse.next();
      }
    }
  }

  // Return 401 Unauthorized with WWW-Authenticate header
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

