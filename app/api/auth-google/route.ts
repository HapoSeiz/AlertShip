import { NextRequest, NextResponse } from 'next/server';
import { app, getAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'ID token is required.' }, { status: 400 });
    }
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    // decodedToken contains user info
    return NextResponse.json({ success: true, user: decodedToken });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 