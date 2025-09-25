import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/firebase/firebaseAdmin';

const ID_TOKEN_COOKIE_NAME = 'idToken';

export async function GET(req: NextRequest) {
  try {
    const idToken = req.cookies.get(ID_TOKEN_COOKIE_NAME)?.value;
    if (!idToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const auth = getAuth();
    const decodedClaims = await auth.verifyIdToken(idToken, true);
    return NextResponse.json({ user: decodedClaims });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 401 });
  }
} 