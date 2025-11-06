import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'auth-session';

export async function POST() {
  try {
    // Create response with JSON body
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );

    // Clear the cookie by setting it to expire immediately
    // Use the same settings as when it was created to ensure it's cleared
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set to epoch time (1970)
      path: '/',
    });

    // Also try to delete it (some browsers prefer this)
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

