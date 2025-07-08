import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/firebase/firebaseAdmin';
import { cookies } from 'next/headers';

const ID_TOKEN_COOKIE_NAME = 'idToken';
const ID_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const auth = getAuth();
    // Verify the ID token
    const decodedIdToken = await auth.verifyIdToken(idToken);

    // Set the ID token in a secure, HTTP-only, SameSite=Strict cookie
    cookies().set({
      name: ID_TOKEN_COOKIE_NAME,
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ID_TOKEN_COOKIE_MAX_AGE,
      sameSite: 'strict',
    });

    return NextResponse.json({ user: decodedIdToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
} 