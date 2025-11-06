import { NextResponse } from 'next/server';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const sessionToken = await getSessionToken();

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Validate session token
    const isValid = validateSessionToken(sessionToken);

    return NextResponse.json(
      { authenticated: isValid },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

