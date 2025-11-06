import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'auth-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate a simple session token
 * In production, you might want to use a more secure method like JWT
 */
export function generateSessionToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  // Use btoa for base64 encoding (works in both Node.js and Edge runtime)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(`${timestamp}-${random}`).toString('base64');
  } else {
    return btoa(`${timestamp}-${random}`);
  }
}

/**
 * Validate session token (works in both Node.js and Edge runtime)
 */
export function validateSessionToken(token: string): boolean {
  try {
    let decoded: string;
    // Decode base64 - use appropriate method based on runtime
    if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(token, 'base64').toString();
    } else {
      decoded = atob(token);
    }
    
    const [timestamp] = decoded.split('-');
    const sessionTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    // Check if session is expired (7 days)
    return (now - sessionTime) < SESSION_DURATION;
  } catch {
    return false;
  }
}

/**
 * Validate session token from cookie (for middleware use)
 */
export function validateSessionFromCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }
  return validateSessionToken(cookieValue);
}

/**
 * Get session cookie value
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validate credentials against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.BASIC_AUTH_USER;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;
  
  // If credentials are not set, allow access (for development)
  if (!validUsername || !validPassword) {
    return true;
  }
  
  return username === validUsername && password === validPassword;
}

